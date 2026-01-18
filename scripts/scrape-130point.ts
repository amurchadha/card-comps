/**
 * 130point.com Sales Scraper
 * Fetches historical eBay sold data for sports cards
 * Rate limit: 10 searches per minute
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ENDPOINT = 'https://back.130point.com/sales/';
const RATE_LIMIT_MS = 6500; // ~10 per minute with buffer

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface SaleRecord {
  title: string;
  price: number;
  currency: string;
  saleDate: string;
  saleType: string;
  bids: number;
  imageUrl: string;
  itemId: string;
}

interface SearchResult {
  query: string;
  results: SaleRecord[];
  error?: string;
}

// Parse HTML response from 130point
function parseResults(html: string): SaleRecord[] {
  const sales: SaleRecord[] = [];

  // 130point returns DataTables-formatted HTML rows
  // Format: <tr id="dRow" data-price="36" data-rowId="1-1" data-currency="USD">

  // Match rows with data attributes
  const rowRegex = /<tr\s+id="dRow"[^>]*data-price="([^"]+)"[^>]*data-currency="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;

  while ((match = rowRegex.exec(html)) !== null) {
    try {
      const price = parseFloat(match[1]);
      const currency = match[2];
      const rowContent = match[3];

      // Extract item ID from eBay link
      const itemIdMatch = rowContent.match(/ebay\.com\/itm\/(\d+)/i);
      const itemId = itemIdMatch ? itemIdMatch[1] : '';

      // Extract title from titleText span
      const titleMatch = rowContent.match(/<a[^>]*href='[^']*ebay[^']*'[^>]*>([^<]+)<\/a>/i);
      let title = titleMatch ? titleMatch[1].trim() : '';
      title = title
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');

      // Extract date from dateText
      const dateMatch = rowContent.match(/<b>Date:<\/b>\s*([^<]+)/i);
      let saleDate = '';
      if (dateMatch) {
        // Parse "Sat 17 Jan 2026 00:00:01 EST" format
        const dateStr = dateMatch[1].trim();
        const dateParts = dateStr.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
        if (dateParts) {
          const months: Record<string, string> = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
                                                    Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
          saleDate = `${dateParts[3]}-${months[dateParts[2]]}-${dateParts[1].padStart(2, '0')}`;
        }
      }

      // Extract bids
      const bidsMatch = rowContent.match(/Bids:\s*<a[^>]*>(\d+)/i);
      const bids = bidsMatch ? parseInt(bidsMatch[1]) : 0;

      // Determine sale type from auctionLabel
      let saleType = 'FixedPrice';
      if (rowContent.includes('Best Offer')) {
        saleType = 'BestOffer';
      } else if (rowContent.includes('>Auction<')) {
        saleType = 'Auction';
      }

      // Extract image URL
      const imgMatch = rowContent.match(/src="([^"]*i\.ebayimg\.com[^"]*)"/i);
      const imageUrl = imgMatch ? imgMatch[1] : '';

      if (title && price > 0 && itemId) {
        sales.push({
          itemId,
          title,
          price,
          currency,
          saleDate,
          saleType,
          bids,
          imageUrl,
        });
      }
    } catch {
      // Skip malformed rows
    }
  }

  return sales;
}

// Alternative parser for JSON-like responses
function parseJsonResults(text: string): SaleRecord[] {
  const sales: SaleRecord[] = [];

  try {
    // Try parsing as JSON first
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      for (const item of data) {
        sales.push({
          itemId: item.itemId || item.id || '',
          title: item.title || item.name || '',
          price: parseFloat(item.price || item.salePrice || 0),
          currency: item.currency || 'USD',
          saleDate: item.date || item.endTime || item.saleDate || '',
          saleType: item.type || item.saleType || 'FixedPrice',
          bids: parseInt(item.bids || 0),
          imageUrl: item.image || item.galleryURL || item.imageUrl || '',
        });
      }
    }
  } catch {
    // Not JSON, fall back to HTML parsing
  }

  return sales;
}

async function search130Point(query: string): Promise<SearchResult> {
  try {
    const formData = new URLSearchParams();
    formData.append('query', query);
    formData.append('type', '1'); // newest first
    formData.append('subcat', '212'); // sports trading cards
    formData.append('tab_id', '1');
    formData.append('tz', 'America/New_York');
    formData.append('sort', '1');

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
        'Accept': 'text/html,application/json,*/*',
        'Origin': 'https://130point.com',
        'Referer': 'https://130point.com/sales/',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return { query, results: [], error: `HTTP ${response.status}` };
    }

    const text = await response.text();

    if (text.includes('ERROR') || text.includes('error')) {
      return { query, results: [], error: text.substring(0, 100) };
    }

    // Try JSON first, then HTML
    let results = parseJsonResults(text);
    if (results.length === 0) {
      results = parseResults(text);
    }

    return { query, results };
  } catch (error) {
    return { query, results: [], error: String(error) };
  }
}

// Store results in Supabase pricing table
async function storePricingData(sales: SaleRecord[], query: string): Promise<number> {
  if (sales.length === 0) return 0;

  let stored = 0;

  for (const sale of sales) {
    try {
      const { error } = await supabase
        .from('pricing_data')
        .upsert({
          item_id: sale.itemId,
          title: sale.title,
          sale_price: sale.price,
          currency: sale.currency,
          sale_date: sale.saleDate,
          sale_type: sale.saleType,
          bids: sale.bids,
          image_url: sale.imageUrl,
          source: '130point',
          search_query: query,
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'item_id',
        });

      if (!error) stored++;
    } catch {
      // Skip duplicates
    }
  }

  return stored;
}

// Priority search queries - high value targets first
const PRIORITY_QUERIES = [
  // Ekitike PSG
  'Ekitike Topps Chrome PSG auto',
  'Ekitike Topps Chrome PSG /99',
  'Ekitike Topps Chrome PSG /75',
  'Ekitike Topps Chrome PSG /50',
  'Ekitike Topps Chrome PSG /25',
  'Ekitike Topps Chrome PSG /10',
  'Ekitike Topps Chrome PSG /5',
  'Ekitike Topps Chrome PSG 1/1',

  // 2024-25 Basketball rookies
  'Wembanyama Prizm auto',
  'Wembanyama Prizm /99',
  'Wembanyama Select auto',
  'Wembanyama Mosaic auto',
  'Cooper Flagg Prizm auto',
  'Cooper Flagg Prizm /99',

  // 2024 Football rookies
  'Caleb Williams Prizm auto',
  'Caleb Williams Prizm /99',
  'Jayden Daniels Prizm auto',
  'Marvin Harrison Jr Prizm auto',
  'Malik Nabers Prizm auto',

  // 2024-25 Soccer
  'Lamine Yamal Topps Chrome auto',
  'Lamine Yamal Prizm auto',
  'Kobbie Mainoo Prizm auto',
  'Endrick Topps Chrome auto',

  // High value parallels
  'Prizm Gold /10',
  'Prizm Black 1/1',
  'Select Gold /10',
  'Mosaic Gold /10',
  'Topps Chrome Gold /50',
  'Topps Chrome Superfractor',
];

// Generate queries from catalog
async function generateCatalogQueries(limit: number = 100): Promise<string[]> {
  const queries: string[] = [];

  // Get popular players from recent sets
  const { data: cards } = await supabase
    .from('card_catalog')
    .select('player_name, card_sets!inner(name, year)')
    .gte('card_sets.year', '2023')
    .eq('is_rookie', true)
    .limit(limit);

  if (cards) {
    for (const card of cards) {
      const setInfo = card.card_sets as { name: string; year: string };
      const query = `${card.player_name} ${setInfo.name} ${setInfo.year}`;
      if (!queries.includes(query) && query.split(' ').length >= 2) {
        queries.push(query);
      }
    }
  }

  return queries;
}

async function main() {
  console.log('==========================================');
  console.log('  130point.com Sales Scraper');
  console.log('  Rate limit: 10 searches/minute');
  console.log('==========================================\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  // Check if pricing_data table exists
  const { error: tableError } = await supabase
    .from('pricing_data')
    .select('item_id')
    .limit(1);

  if (tableError?.message.includes('does not exist')) {
    console.log('Creating pricing_data table...');
    // Table needs to be created via migration
    console.error('Please create the pricing_data table first. See migrations/002_pricing_data.sql');
    process.exit(1);
  }

  const allQueries = [...PRIORITY_QUERIES];

  // Add catalog-based queries
  const catalogQueries = await generateCatalogQueries(50);
  for (const q of catalogQueries) {
    if (!allQueries.includes(q)) {
      allQueries.push(q);
    }
  }

  console.log(`Total queries to run: ${allQueries.length}`);
  console.log(`Estimated time: ${Math.ceil(allQueries.length * RATE_LIMIT_MS / 60000)} minutes\n`);

  let totalSales = 0;
  let totalStored = 0;
  let errors = 0;

  for (let i = 0; i < allQueries.length; i++) {
    const query = allQueries[i];
    console.log(`[${i + 1}/${allQueries.length}] Searching: ${query}`);

    const result = await search130Point(query);

    if (result.error) {
      console.log(`  Error: ${result.error}`);
      errors++;
    } else {
      console.log(`  Found: ${result.results.length} sales`);
      totalSales += result.results.length;

      if (result.results.length > 0) {
        const stored = await storePricingData(result.results, query);
        console.log(`  Stored: ${stored}`);
        totalStored += stored;
      }
    }

    // Rate limit - wait between requests
    if (i < allQueries.length - 1) {
      await delay(RATE_LIMIT_MS);
    }
  }

  console.log('\n==========================================');
  console.log('  COMPLETE');
  console.log('==========================================');
  console.log(`  Queries run: ${allQueries.length}`);
  console.log(`  Total sales found: ${totalSales}`);
  console.log(`  Total stored: ${totalStored}`);
  console.log(`  Errors: ${errors}`);
  console.log('==========================================');
}

main().catch(console.error);
