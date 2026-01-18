/**
 * 130point.com Continuous Scraper
 * Pulls every unique player/set from catalog and gets pricing
 * Rate limit: 10 searches per minute
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ENDPOINT = 'https://back.130point.com/sales/';
const RATE_LIMIT_MS = 6500; // ~10 per minute with buffer
const BATCH_SIZE = 500; // Process this many unique combos at a time

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

function parseResults(html: string): SaleRecord[] {
  const sales: SaleRecord[] = [];
  const rowRegex = /<tr\s+id="dRow"[^>]*data-price="([^"]+)"[^>]*data-currency="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;

  while ((match = rowRegex.exec(html)) !== null) {
    try {
      const price = parseFloat(match[1]);
      const currency = match[2];
      const rowContent = match[3];

      const itemIdMatch = rowContent.match(/ebay\.com\/itm\/(\d+)/i);
      const itemId = itemIdMatch ? itemIdMatch[1] : '';

      const titleMatch = rowContent.match(/<a[^>]*href='[^']*ebay[^']*'[^>]*>([^<]+)<\/a>/i);
      let title = titleMatch ? titleMatch[1].trim() : '';
      title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

      const dateMatch = rowContent.match(/<b>Date:<\/b>\s*([^<]+)/i);
      let saleDate = '';
      if (dateMatch) {
        const dateStr = dateMatch[1].trim();
        const dateParts = dateStr.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
        if (dateParts) {
          const months: Record<string, string> = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
                                                    Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
          saleDate = `${dateParts[3]}-${months[dateParts[2]]}-${dateParts[1].padStart(2, '0')}`;
        }
      }

      const bidsMatch = rowContent.match(/Bids:\s*<a[^>]*>(\d+)/i);
      const bids = bidsMatch ? parseInt(bidsMatch[1]) : 0;

      let saleType = 'FixedPrice';
      if (rowContent.includes('Best Offer')) saleType = 'BestOffer';
      else if (rowContent.includes('>Auction<')) saleType = 'Auction';

      const imgMatch = rowContent.match(/src="([^"]*i\.ebayimg\.com[^"]*)"/i);
      const imageUrl = imgMatch ? imgMatch[1] : '';

      if (title && price > 0 && itemId) {
        sales.push({ itemId, title, price, currency, saleDate, saleType, bids, imageUrl });
      }
    } catch { /* skip */ }
  }
  return sales;
}

async function search130Point(query: string): Promise<{ results: SaleRecord[]; error?: string }> {
  try {
    const formData = new URLSearchParams();
    formData.append('query', query);
    formData.append('type', '1');
    formData.append('subcat', '212');
    formData.append('tab_id', '1');
    formData.append('tz', 'America/New_York');

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        'Origin': 'https://130point.com',
        'Referer': 'https://130point.com/sales/',
      },
      body: formData.toString(),
    });

    if (!response.ok) return { results: [], error: `HTTP ${response.status}` };
    const text = await response.text();
    if (text.includes('ERROR')) return { results: [], error: text.substring(0, 100) };
    return { results: parseResults(text) };
  } catch (error) {
    return { results: [], error: String(error) };
  }
}

async function storePricingData(sales: SaleRecord[], query: string, catalogId?: string, setId?: string): Promise<number> {
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
          catalog_id: catalogId || null,
          set_id: setId || null,
          matched_at: catalogId ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
        }, { onConflict: 'item_id' });

      if (!error) stored++;
    } catch { /* skip duplicates */ }
  }
  return stored;
}

// Track which queries we've already run
async function getCompletedQueries(): Promise<Set<string>> {
  const { data } = await supabase
    .from('pricing_data')
    .select('search_query')
    .not('search_query', 'is', null);

  const queries = new Set<string>();
  data?.forEach(d => queries.add(d.search_query));
  return queries;
}

// Get unique player/set combinations from catalog
async function getUniqueCards(offset: number, limit: number): Promise<Array<{
  player_name: string;
  set_name: string;
  set_year: string;
  catalog_id: string;
  set_id: string;
}>> {
  const { data } = await supabase
    .from('card_catalog')
    .select(`
      id,
      player_name,
      set_id,
      card_sets!inner(name, year)
    `)
    .not('player_name', 'is', null)
    .order('id')
    .range(offset, offset + limit - 1);

  if (!data) return [];

  return data.map(d => ({
    player_name: d.player_name,
    set_name: (d.card_sets as any).name,
    set_year: (d.card_sets as any).year,
    catalog_id: d.id,
    set_id: d.set_id,
  }));
}

// Build a search query from card data
function buildQuery(card: { player_name: string; set_name: string; set_year: string }): string {
  // Clean up the set name - remove common words
  let setName = card.set_name
    .replace(/Basketball|Football|Soccer|Cards?/gi, '')
    .replace(/Checklist/gi, '')
    .trim();

  // Keep it to 2-4 words for better results
  const words = `${card.player_name} ${setName} ${card.set_year}`.split(/\s+/).filter(w => w.length > 1);
  return words.slice(0, 5).join(' ');
}

async function main() {
  console.log('==========================================');
  console.log('  130point.com Continuous Scraper');
  console.log('  Scraping pricing for ALL catalog cards');
  console.log('==========================================\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  // Get catalog stats
  const { count: totalCards } = await supabase.from('card_catalog').select('*', { count: 'exact', head: true });
  const { count: totalPricing } = await supabase.from('pricing_data').select('*', { count: 'exact', head: true });

  console.log(`Catalog cards: ${totalCards?.toLocaleString()}`);
  console.log(`Pricing records: ${totalPricing?.toLocaleString()}`);
  console.log(`Rate: 10 queries/min\n`);

  const completedQueries = await getCompletedQueries();
  console.log(`Queries already run: ${completedQueries.size}\n`);

  let offset = 0;
  let totalSearched = 0;
  let totalSales = 0;
  let totalStored = 0;
  let errors = 0;
  let skipped = 0;

  // Process in batches
  while (true) {
    const cards = await getUniqueCards(offset, BATCH_SIZE);
    if (cards.length === 0) {
      console.log('\nReached end of catalog!');
      break;
    }

    console.log(`\n--- Batch starting at offset ${offset} (${cards.length} cards) ---\n`);

    for (const card of cards) {
      const query = buildQuery(card);

      // Skip if already searched
      if (completedQueries.has(query)) {
        skipped++;
        continue;
      }

      // 130point requires at least 2 words
      if (query.split(/\s+/).length < 2) {
        skipped++;
        continue;
      }

      totalSearched++;
      console.log(`[${totalSearched}] ${query}`);

      const result = await search130Point(query);

      if (result.error) {
        console.log(`  Error: ${result.error}`);
        errors++;
      } else {
        console.log(`  Found: ${result.results.length} sales`);
        totalSales += result.results.length;

        if (result.results.length > 0) {
          const stored = await storePricingData(result.results, query, card.catalog_id, card.set_id);
          console.log(`  Stored: ${stored}`);
          totalStored += stored;
        }
      }

      completedQueries.add(query);

      // Progress update every 50 searches
      if (totalSearched % 50 === 0) {
        const { count: currentPricing } = await supabase.from('pricing_data').select('*', { count: 'exact', head: true });
        console.log(`\n=== PROGRESS: ${totalSearched} searches, ${currentPricing} total pricing records ===\n`);
      }

      await delay(RATE_LIMIT_MS);
    }

    offset += BATCH_SIZE;

    // Brief pause between batches
    console.log('\nBatch complete. Brief pause...');
    await delay(5000);
  }

  const { count: finalPricing } = await supabase.from('pricing_data').select('*', { count: 'exact', head: true });

  console.log('\n==========================================');
  console.log('  COMPLETE');
  console.log('==========================================');
  console.log(`  Cards processed: ${offset}`);
  console.log(`  Searches run: ${totalSearched}`);
  console.log(`  Skipped (already done): ${skipped}`);
  console.log(`  Total sales found: ${totalSales}`);
  console.log(`  Total stored: ${totalStored}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Final pricing records: ${finalPricing}`);
  console.log('==========================================');
}

main().catch(console.error);
