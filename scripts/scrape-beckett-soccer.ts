/**
 * Beckett Soccer Checklist Scraper
 * Scrapes the latest soccer card checklists from Beckett.com
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DELAY_MS = 2000; // Be respectful to Beckett

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Known recent soccer set URLs from Beckett
const BECKETT_SOCCER_URLS = [
  'https://www.beckett.com/news/2025-26-topps-uefa-club-competitions-soccer-cards/',
  'https://www.beckett.com/news/2024-25-topps-uefa-club-competitions-soccer-cards/',
  'https://www.beckett.com/news/2024-25-panini-prizm-premier-league-soccer-cards/',
  'https://www.beckett.com/news/2024-25-topps-chrome-uefa-club-competitions-soccer/',
  'https://www.beckett.com/news/2024-25-panini-select-soccer-cards/',
  'https://www.beckett.com/news/2024-25-topps-finest-uefa-club-competitions-soccer/',
  'https://www.beckett.com/news/2024-25-panini-mosaic-premier-league-soccer/',
  'https://www.beckett.com/news/2024-topps-chrome-mls-soccer-cards/',
];

async function fetchPage(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      if (response.ok) return await response.text();
      if (response.status === 404) return null;
      console.log(`  Retry ${i + 1}: Status ${response.status}`);
    } catch (e) {
      console.log(`  Retry ${i + 1}: ${e}`);
    }
    await delay(DELAY_MS);
  }
  return null;
}

function parseSetMetadata(url: string, html: string) {
  // Extract year from URL like "2025-26" or "2024-25"
  const yearMatch = url.match(/(\d{4}-\d{2}|\d{4})/);
  const year = yearMatch ? yearMatch[1] : '';

  // Extract title
  const titleMatch = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([^<]+)<\/h1>/i)
    || html.match(/<title>([^<|]+)/i);
  let name = titleMatch ? titleMatch[1].trim() : '';
  name = name.replace(/ Checklist$| Cards$/i, '').trim();

  // Determine manufacturer
  let manufacturer = 'Unknown';
  const lower = url.toLowerCase();
  if (lower.includes('topps')) manufacturer = 'Topps';
  else if (lower.includes('panini') || lower.includes('prizm') || lower.includes('select') || lower.includes('mosaic')) manufacturer = 'Panini';
  else if (lower.includes('leaf')) manufacturer = 'Leaf';
  else if (lower.includes('upper-deck')) manufacturer = 'Upper Deck';

  // Product line
  let productLine = '';
  const patterns = ['prizm', 'select', 'mosaic', 'chrome', 'finest', 'donruss', 'optic', 'topps'];
  for (const p of patterns) {
    if (lower.includes(p)) {
      productLine = p.charAt(0).toUpperCase() + p.slice(1);
      break;
    }
  }

  return { name, year, manufacturer, productLine };
}

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
  const text = html
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/<br\s*\/?>/gi, '\n');

  let currentSubset = 'Base';
  let isRookie = false;
  let isAuto = false;
  let isInsert = false;

  // Split by lines and paragraphs
  const lines = text.split(/\n|<\/p>|<\/li>/gi);

  for (const line of lines) {
    const clean = line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean || clean.length < 3) continue;

    // Detect subset headers
    if (/^base\s*(set|cards?|checklist)?$/i.test(clean) || /^base\s*–/i.test(clean)) {
      currentSubset = 'Base';
      isRookie = false;
      isAuto = false;
      isInsert = false;
      continue;
    }
    if (/autograph/i.test(clean) && clean.length < 50 && !/\d+\s+\w/.test(clean)) {
      currentSubset = clean.replace(/<[^>]+>/g, '').trim() || 'Autographs';
      isAuto = true;
      isRookie = false;
      isInsert = false;
      continue;
    }
    if (/insert|parallel/i.test(clean) && clean.length < 50 && !/\d+\s+\w/.test(clean)) {
      currentSubset = clean.replace(/<[^>]+>/g, '').trim() || 'Inserts';
      isInsert = true;
      isAuto = false;
      continue;
    }
    if (/rookie|future\s*star/i.test(clean) && clean.length < 50) {
      isRookie = true;
    }

    // Parse card entries - Beckett format: "1 Player Name, Team" or "XX-AB Player Name, Team"
    // Format 1: Numeric card number
    const numericMatch = clean.match(/^(\d+)\s+([A-Z][a-zA-Z\.\s\-']+?),\s*(.+)$/);
    if (numericMatch) {
      const [, cardNumber, playerName, team] = numericMatch;
      if (playerName.length >= 2 && !/^(checklist|header|team card)/i.test(playerName)) {
        const key = `${cardNumber}-${playerName}-${currentSubset}`;
        if (!seen.has(key)) {
          seen.add(key);
          cards.push({
            cardNumber: cardNumber.trim(),
            playerName: playerName.trim(),
            team: team.trim(),
            subsetName: currentSubset,
            isRookie,
            isAutograph: isAuto,
            isInsert,
          });
        }
      }
      continue;
    }

    // Format 2: Alphanumeric card number (BA-A, 55-LM, etc.)
    const alphaMatch = clean.match(/^([A-Z0-9]+-[A-Z0-9]+)\s+([A-Z][a-zA-Z\.\s\-']+?),\s*(.+)$/);
    if (alphaMatch) {
      const [, cardNumber, playerName, team] = alphaMatch;
      if (playerName.length >= 2) {
        const key = `${cardNumber}-${playerName}-${currentSubset}`;
        if (!seen.has(key)) {
          seen.add(key);
          cards.push({
            cardNumber: cardNumber.trim(),
            playerName: playerName.trim(),
            team: team.trim(),
            subsetName: currentSubset,
            isRookie,
            isAutograph: isAuto,
            isInsert,
          });
        }
      }
    }
  }

  return cards;
}

async function scrapeSet(url: string) {
  console.log(`\nProcessing: ${url}`);
  await delay(DELAY_MS);

  const html = await fetchPage(url);
  if (!html) {
    console.log('  Failed to fetch page');
    return;
  }

  const metadata = parseSetMetadata(url, html);
  console.log(`  Set: ${metadata.name}`);
  console.log(`  Year: ${metadata.year}, Manufacturer: ${metadata.manufacturer}`);

  // Check if set exists
  const { data: existingSet } = await supabase
    .from('card_sets')
    .select('id')
    .eq('source_url', url)
    .single();

  let setId: string;

  if (existingSet) {
    setId = existingSet.id;
    console.log(`  Set already exists: ${setId}`);
  } else {
    const { data: newSet, error } = await supabase
      .from('card_sets')
      .insert({
        name: metadata.name,
        year: metadata.year,
        sport: 'soccer',
        manufacturer: metadata.manufacturer,
        product_line: metadata.productLine,
        source_url: url,
      })
      .select('id')
      .single();

    if (error) {
      console.log(`  Error creating set: ${error.message}`);
      return;
    }
    setId = newSet.id;
    console.log(`  Created set: ${setId}`);
  }

  const cards = parseChecklist(html);
  console.log(`  Found ${cards.length} cards`);

  if (cards.length === 0) return;

  // Delete existing cards for this set and re-insert
  await supabase.from('card_catalog').delete().eq('set_id', setId);

  // Batch insert
  for (let i = 0; i < cards.length; i += 100) {
    const batch = cards.slice(i, i + 100).map(c => ({
      set_id: setId,
      card_number: c.cardNumber,
      player_name: c.playerName,
      team: c.team,
      subset_name: c.subsetName,
      is_rookie: c.isRookie,
      is_autograph: c.isAutograph,
      is_insert: c.isInsert,
    }));
    await supabase.from('card_catalog').insert(batch);
  }
  console.log(`  Inserted ${cards.length} cards`);
}

async function discoverNewSets(): Promise<string[]> {
  console.log('\nDiscovering new soccer sets from Beckett...');

  // Fetch Beckett soccer news/checklists page
  const searchUrls = [
    'https://www.beckett.com/news/category/soccer-cards/',
    'https://www.beckett.com/news/tag/soccer-checklist/',
  ];

  const foundUrls: string[] = [];

  for (const searchUrl of searchUrls) {
    const html = await fetchPage(searchUrl);
    if (!html) continue;

    // Find checklist article links
    const linkRegex = /href="(https:\/\/www\.beckett\.com\/news\/\d{4}[^"]*soccer[^"]*cards[^"]*)"/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      if (!foundUrls.includes(url) && !BECKETT_SOCCER_URLS.includes(url)) {
        foundUrls.push(url);
      }
    }

    await delay(DELAY_MS);
  }

  console.log(`  Found ${foundUrls.length} additional set URLs`);
  return foundUrls;
}

async function main() {
  console.log('Beckett Soccer Checklist Scraper');
  console.log('================================\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Scrape known URLs first
  console.log(`Scraping ${BECKETT_SOCCER_URLS.length} known set URLs...`);
  for (const url of BECKETT_SOCCER_URLS) {
    await scrapeSet(url);
  }

  // Try to discover new sets
  const newUrls = await discoverNewSets();
  for (const url of newUrls) {
    await scrapeSet(url);
  }

  // Final count
  const { count } = await supabase
    .from('card_catalog')
    .select('*', { count: 'exact', head: true });

  console.log(`\n================================`);
  console.log(`Total cards in DB: ${count}`);
}

main().catch(console.error);
