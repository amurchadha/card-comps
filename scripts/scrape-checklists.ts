/**
 * Cardboard Connection Basketball Checklist Scraper
 *
 * Scrapes basketball card checklists and stores them in Supabase.
 * Run with: npx tsx scripts/scrape-checklists.ts
 */

import { createClient } from '@supabase/supabase-js';

// Config
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BASE_URL = 'https://www.cardboardconnection.com';
const DELAY_MS = 1000; // 1 second between requests

// Years to scrape - going back to 1990
const YEARS = [
  '2025-2026',
  '2024-2025',
  '2023-2024',
  '2022-2023',
  '2021-2022',
  '2020-2021',
  '2019-2020',
  '2018-2019',
  '2017-2018',
  '2016-2017',
  '2015-2016',
  '2014-2015',
  '2013-2014',
  '2012-2013',
  '2011-2012',
  '2010-2011',
  '2009-2010',
  '2008-2009',
  '2007-2008',
  '2006-2007',
  '2005-2006',
  '2004-2005',
  '2003-2004',
  '2002-2003',
  '2001-2002',
  '2000-2001',
  '1999-2000',
  '1998-1999',
  '1997-1998',
  '1996-1997',
  '1995-1996',
  '1994-1995',
  '1993-1994',
  '1992-1993',
  '1991-1992',
  '1990-1991',
];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Utility: delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: fetch with retry
async function fetchPage(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CardCompsBot/1.0; +https://card-comps.pages.dev)',
        },
      });
      if (response.ok) {
        return await response.text();
      }
      if (response.status === 404) {
        console.log(`  404: ${url}`);
        return null;
      }
      console.log(`  Retry ${i + 1}: ${response.status} for ${url}`);
    } catch (error) {
      console.log(`  Retry ${i + 1}: Error fetching ${url}`);
    }
    await delay(DELAY_MS);
  }
  return null;
}

// Extract set URLs from a year page
function extractSetUrls(html: string): string[] {
  const urls: string[] = [];

  // Match links to individual set pages
  // Pattern: /202X-XX-[brand]-[product]-basketball or similar
  const linkRegex = /href="(https:\/\/www\.cardboardconnection\.com\/\d{4}-\d{2}-[^"]+basketball[^"]*)"/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    // Filter out year index pages, keep only product pages
    if (!url.includes('-basketball-cards"') || url.includes('panini') || url.includes('topps') || url.includes('donruss') || url.includes('bowman') || url.includes('hoops') || url.includes('leaf')) {
      if (!urls.includes(url)) {
        urls.push(url);
      }
    }
  }

  return urls;
}

// Parse set metadata from URL and page content
function parseSetMetadata(url: string, html: string): {
  name: string;
  year: string;
  manufacturer: string;
  productLine: string;
} {
  // Extract from URL: /2022-23-panini-prizm-basketball-nba-cards
  const urlMatch = url.match(/\/(\d{4}-\d{2})-([^\/]+)/);
  const year = urlMatch ? urlMatch[1] : '';
  const slug = urlMatch ? urlMatch[2] : '';

  // Try to get title from HTML
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                     html.match(/<title>([^<|]+)/i);
  const name = titleMatch ? titleMatch[1].trim() : slug.replace(/-/g, ' ');

  // Determine manufacturer
  let manufacturer = 'Unknown';
  const lowerSlug = slug.toLowerCase();
  if (lowerSlug.includes('panini') || lowerSlug.includes('prizm') || lowerSlug.includes('donruss') || lowerSlug.includes('hoops') || lowerSlug.includes('mosaic') || lowerSlug.includes('select') || lowerSlug.includes('contenders') || lowerSlug.includes('optic')) {
    manufacturer = 'Panini';
  } else if (lowerSlug.includes('topps') || lowerSlug.includes('bowman') || lowerSlug.includes('chrome') || lowerSlug.includes('finest')) {
    manufacturer = 'Topps';
  } else if (lowerSlug.includes('leaf')) {
    manufacturer = 'Leaf';
  } else if (lowerSlug.includes('upper-deck')) {
    manufacturer = 'Upper Deck';
  }

  // Determine product line
  let productLine = '';
  const productPatterns = [
    'prizm', 'select', 'mosaic', 'hoops', 'donruss', 'contenders', 'optic',
    'national-treasures', 'flawless', 'immaculate', 'spectra', 'origins',
    'court-kings', 'chronicles', 'revolution', 'noir', 'one-and-one',
    'chrome', 'finest', 'bowman', 'stadium-club'
  ];
  for (const pattern of productPatterns) {
    if (lowerSlug.includes(pattern)) {
      productLine = pattern.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      break;
    }
  }

  return { name, year, manufacturer, productLine };
}

// Parse checklist from page HTML
interface CardEntry {
  cardNumber: string;
  playerName: string;
  team: string;
  subsetName: string;
  isRookie: boolean;
  isAutograph: boolean;
  isInsert: boolean;
}

function parseChecklist(html: string): CardEntry[] {
  const cards: CardEntry[] = [];
  const seen = new Set<string>();

  // Clean HTML entities
  let text = html
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

  // Split by <br /> or <br> to get individual entries
  const entries = text.split(/<br\s*\/?>/gi);

  let currentSubset = 'Base';
  let isCurrentRookie = false;
  let isCurrentAutograph = false;
  let isCurrentInsert = false;

  for (const entry of entries) {
    // Strip remaining HTML tags
    const clean = entry.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!clean) continue;

    // Check for section headers
    if (/^(base\s*(set|cards?)|checklist)/i.test(clean) && clean.length < 80) {
      currentSubset = 'Base';
      isCurrentRookie = false;
      isCurrentAutograph = false;
      isCurrentInsert = false;
      continue;
    }
    if (/rookie/i.test(clean) && clean.length < 80 && !/\d+\s+\w/.test(clean)) {
      currentSubset = 'Rookies';
      isCurrentRookie = true;
      isCurrentAutograph = false;
      isCurrentInsert = false;
      continue;
    }
    if (/(autograph|signature)/i.test(clean) && clean.length < 80 && !/\d+\s+\w/.test(clean)) {
      currentSubset = 'Autographs';
      isCurrentRookie = false;
      isCurrentAutograph = true;
      isCurrentInsert = false;
      continue;
    }
    if (/(insert|fearless|fireworks|emergent|sensational)/i.test(clean) && clean.length < 80 && !/\d+\s+\w/.test(clean)) {
      currentSubset = clean.slice(0, 30);
      isCurrentRookie = false;
      isCurrentAutograph = false;
      isCurrentInsert = true;
      continue;
    }

    // Match card entries: "17 Jayson Tatum - Boston Celtics"
    const cardMatch = clean.match(/^(\d+)\s+([A-Z][a-zA-Z\.\s\-']+?(?:\s+(?:Jr\.|Sr\.|III|II|IV))?)\s*[-–]\s*(.+)$/);

    if (cardMatch) {
      const [, cardNumber, playerName, team] = cardMatch;
      const cleanPlayer = playerName.trim();
      const cleanTeam = team.trim().replace(/\s+/g, ' ');

      // Skip non-player entries
      if (cleanPlayer.length < 2 || /^(checklist|header|team|logo|card)/i.test(cleanPlayer)) {
        continue;
      }

      // Dedupe
      const key = `${cardNumber}-${cleanPlayer}-${currentSubset}`;
      if (seen.has(key)) continue;
      seen.add(key);

      cards.push({
        cardNumber: cardNumber.trim(),
        playerName: cleanPlayer,
        team: cleanTeam,
        subsetName: currentSubset,
        isRookie: isCurrentRookie || /rookie/i.test(currentSubset),
        isAutograph: isCurrentAutograph || /autograph|signature/i.test(currentSubset),
        isInsert: isCurrentInsert,
      });
    }
  }

  return cards;
}

// Main scraper function
async function scrapeYear(year: string) {
  console.log(`\n=== Scraping ${year} basketball sets ===`);

  const yearSlug = year.toLowerCase().replace('20', '').replace('-20', '-');
  const yearUrl = `${BASE_URL}/sports-cards-sets/nba-basketball-cards/${year}-basketball-cards`;

  console.log(`Fetching year index: ${yearUrl}`);
  const yearHtml = await fetchPage(yearUrl);

  if (!yearHtml) {
    console.log(`Failed to fetch year page for ${year}`);
    return;
  }

  const setUrls = extractSetUrls(yearHtml);
  console.log(`Found ${setUrls.length} set URLs`);

  for (const setUrl of setUrls) {
    console.log(`\nProcessing: ${setUrl}`);
    await delay(DELAY_MS);

    const setHtml = await fetchPage(setUrl);
    if (!setHtml) continue;

    const metadata = parseSetMetadata(setUrl, setHtml);
    console.log(`  Set: ${metadata.name}`);
    console.log(`  Manufacturer: ${metadata.manufacturer}, Product: ${metadata.productLine}`);

    // Insert or get set
    const { data: existingSet } = await supabase
      .from('card_sets')
      .select('id')
      .eq('source_url', setUrl)
      .single();

    let setId: string;

    if (existingSet) {
      setId = existingSet.id;
      console.log(`  Set already exists: ${setId}`);
    } else {
      const { data: newSet, error: setError } = await supabase
        .from('card_sets')
        .insert({
          name: metadata.name,
          year: metadata.year,
          sport: 'basketball',
          manufacturer: metadata.manufacturer,
          product_line: metadata.productLine,
          source_url: setUrl,
        })
        .select('id')
        .single();

      if (setError) {
        console.log(`  Error inserting set: ${setError.message}`);
        continue;
      }
      setId = newSet.id;
      console.log(`  Created set: ${setId}`);
    }

    // Parse and insert cards
    const cards = parseChecklist(setHtml);
    console.log(`  Found ${cards.length} cards in checklist`);

    if (cards.length === 0) {
      console.log(`  No cards found - checklist may not be published yet`);
      continue;
    }

    // Delete existing cards for this set (in case of re-scrape)
    await supabase.from('card_catalog').delete().eq('set_id', setId);

    // Insert cards in batches
    const batchSize = 100;
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize).map(card => ({
        set_id: setId,
        card_number: card.cardNumber,
        player_name: card.playerName,
        team: card.team,
        subset_name: card.subsetName,
        is_rookie: card.isRookie,
        is_autograph: card.isAutograph,
        is_insert: card.isInsert,
        is_parallel: false,
        parallel_name: null,
        print_run: null,
      }));

      const { error: insertError } = await supabase
        .from('card_catalog')
        .insert(batch);

      if (insertError) {
        console.log(`  Error inserting batch: ${insertError.message}`);
      }
    }

    console.log(`  Inserted ${cards.length} cards`);
  }
}

// Entry point
async function main() {
  console.log('Cardboard Connection Basketball Scraper');
  console.log('======================================');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    console.log('\nUsage:');
    console.log('  SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/scrape-checklists.ts');
    process.exit(1);
  }

  for (const year of YEARS) {
    await scrapeYear(year);
  }

  console.log('\n=== Scraping complete ===');

  // Print summary
  const { count: setCount } = await supabase
    .from('card_sets')
    .select('*', { count: 'exact', head: true });

  const { count: cardCount } = await supabase
    .from('card_catalog')
    .select('*', { count: 'exact', head: true });

  console.log(`Total sets: ${setCount}`);
  console.log(`Total cards: ${cardCount}`);
}

main().catch(console.error);
