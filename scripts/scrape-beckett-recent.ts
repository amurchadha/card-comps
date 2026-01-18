/**
 * Beckett Recent Sets Scraper
 * Focuses on 2020+ basketball, football, and soccer sets
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DELAY_MS = 1500;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Recent release date index pages to scrape
const INDEX_PAGES = [
  // Basketball 2020-2025
  'https://www.beckett.com/news/2024-25-basketball-cards-checklists-release-dates/',
  'https://www.beckett.com/news/2023-24-basketball-cards-checklists-release-dates-information/',
  'https://www.beckett.com/news/2022-23-basketball-cards-release-dates-checklists-set-information/',
  'https://www.beckett.com/news/2021-22-basketball-cards-release-dates-checklists-set-information/',
  'https://www.beckett.com/news/2020-21-basketball-cards-release-dates-checklists-set-information/',

  // Football 2020-2025
  'https://www.beckett.com/news/2025-football-cards-release-dates-checklists-and-set-information/',
  'https://www.beckett.com/news/2024-football-cards-release-dates-checklists/',
  'https://www.beckett.com/news/2023-football-cards-release-dates-checklists/',
  'https://www.beckett.com/news/2022-football-cards-release-dates-checklists/',
  'https://www.beckett.com/news/2021-football-cards-release-dates-checklists/',
  'https://www.beckett.com/news/2020-football-cards-release-dates-checklists/',

  // Soccer - most recent
  'https://www.beckett.com/news/category/beckett-soccer/upcoming-sets-beckett-soccer/',
  'https://www.beckett.com/news/category/beckett-soccer/2020s-soccer-cards/2025-soccer-card-sets/',
  'https://www.beckett.com/news/category/beckett-soccer/2020s-soccer-cards/2024-soccer-card-sets/',
];

// Direct checklist URLs for popular recent sets
const DIRECT_URLS = [
  // 2024-25 Basketball
  'https://www.beckett.com/news/2024-25-panini-prizm-basketball-cards/',
  'https://www.beckett.com/news/2024-25-panini-select-basketball-cards/',
  'https://www.beckett.com/news/2024-25-panini-donruss-basketball-cards/',
  'https://www.beckett.com/news/2024-25-panini-mosaic-basketball-cards/',
  'https://www.beckett.com/news/2024-25-panini-contenders-basketball-cards/',
  'https://www.beckett.com/news/2024-25-panini-nba-hoops-basketball-cards/',
  'https://www.beckett.com/news/2024-25-panini-chronicles-basketball-cards/',
  'https://www.beckett.com/news/2024-25-panini-court-kings-basketball-cards/',

  // 2025 Football
  'https://www.beckett.com/news/2025-panini-prizm-football-cards/',
  'https://www.beckett.com/news/2025-panini-select-football-cards/',
  'https://www.beckett.com/news/2025-panini-donruss-football-cards/',
  'https://www.beckett.com/news/2025-panini-mosaic-football-cards/',
  'https://www.beckett.com/news/2025-panini-contenders-football-cards/',
  'https://www.beckett.com/news/2025-donruss-optic-football-cards/',

  // 2024 Football
  'https://www.beckett.com/news/2024-panini-prizm-football-cards/',
  'https://www.beckett.com/news/2024-panini-select-football-cards/',
  'https://www.beckett.com/news/2024-panini-mosaic-football-cards/',
  'https://www.beckett.com/news/2024-panini-contenders-football-cards/',
  'https://www.beckett.com/news/2024-panini-donruss-football-cards/',
  'https://www.beckett.com/news/2024-panini-chronicles-draft-picks-football/',
  'https://www.beckett.com/news/2024-topps-chrome-football-cards/',

  // 2025-26 Soccer
  'https://www.beckett.com/news/2025-26-topps-uefa-club-competitions-soccer-cards/',
  'https://www.beckett.com/news/2025-26-donruss-road-to-fifa-world-cup-26-soccer-cards/',
  'https://www.beckett.com/news/2025-26-panini-prizm-fifa-soccer-details/',
  'https://www.beckett.com/news/2025-26-panini-noir-road-to-fifa-world-cup-26-soccer-details/',
  'https://www.beckett.com/news/2025-topps-chrome-mls-soccer-cards/',

  // 2024-25 Soccer
  'https://www.beckett.com/news/2024-25-topps-chrome-uefa-club-competitions-soccer/',
  'https://www.beckett.com/news/2024-25-panini-prizm-premier-league-soccer-cards/',
  'https://www.beckett.com/news/2024-25-panini-select-soccer-cards/',
  'https://www.beckett.com/news/2024-25-topps-finest-uefa-club-competitions-soccer/',
  'https://www.beckett.com/news/2024-25-panini-mosaic-premier-league-soccer/',
];

async function fetchPage(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      if (response.ok) return await response.text();
      if (response.status === 404) return null;
    } catch {
      // retry
    }
    await delay(DELAY_MS * 2);
  }
  return null;
}

function detectSport(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('soccer') || lower.includes('uefa') || lower.includes('premier') || lower.includes('mls') || lower.includes('fifa')) return 'soccer';
  if (lower.includes('basketball') || lower.includes('nba') || lower.includes('hoops')) return 'basketball';
  if (lower.includes('football') || lower.includes('nfl')) return 'football';
  return 'other';
}

function parseSetMetadata(url: string, html: string) {
  const yearMatch = url.match(/(\d{4}-\d{2}|\d{4})/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/<title>([^<|–-]+)/i);
  let name = titleMatch ? titleMatch[1].trim() : '';
  name = name.replace(/\s*Checklist.*$/i, '').replace(/\s*Cards\s*$/i, '').trim();

  let manufacturer = 'Unknown';
  const lower = (url + ' ' + name).toLowerCase();
  if (lower.includes('topps') || lower.includes('bowman') || lower.includes('chrome') || lower.includes('finest')) {
    manufacturer = 'Topps';
  } else if (lower.includes('panini') || lower.includes('prizm') || lower.includes('select') || lower.includes('mosaic') || lower.includes('donruss')) {
    manufacturer = 'Panini';
  } else if (lower.includes('upper deck')) {
    manufacturer = 'Upper Deck';
  }

  let productLine = '';
  const patterns = ['prizm', 'select', 'mosaic', 'optic', 'chrome', 'finest', 'donruss', 'contenders', 'hoops', 'chronicles'];
  for (const p of patterns) {
    if (lower.includes(p)) {
      productLine = p.charAt(0).toUpperCase() + p.slice(1);
      break;
    }
  }

  return { name, year, manufacturer, productLine, sport: detectSport(url) };
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

  const text = html
    .replace(/&#8211;|–/g, '-')
    .replace(/&#8217;|&#8216;|'/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n');

  let currentSubset = 'Base';
  let isRookie = false;
  let isAuto = false;
  let isInsert = false;

  const lines = text.split('\n');

  for (const line of lines) {
    const clean = line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean || clean.length < 3) continue;

    // Detect subset headers
    const isHeader = clean.length < 60 && !/^\d+\s|^[A-Z]+-[A-Z0-9]+\s/.test(clean);
    if (isHeader) {
      const lower = clean.toLowerCase();
      if (/^base\b|base set/i.test(clean)) {
        currentSubset = 'Base'; isRookie = false; isAuto = false; isInsert = false;
        continue;
      }
      if (/rookie|rc\b|future star/i.test(lower)) {
        currentSubset = clean.length < 40 ? clean : 'Rookies'; isRookie = true;
        continue;
      }
      if (/autograph|auto\b|signature/i.test(lower)) {
        currentSubset = clean.length < 40 ? clean : 'Autographs'; isAuto = true;
        continue;
      }
      if (/insert|variation/i.test(lower)) {
        currentSubset = clean.length < 40 ? clean : 'Inserts'; isInsert = true;
        continue;
      }
    }

    // Parse card entries
    let match = clean.match(/^(\d+)\s+([A-Z][a-zA-Z\.\s\-']+?)\s*[,\-]\s*(.+)$/);
    if (!match) match = clean.match(/^([A-Z]{1,4}-?[A-Z0-9]{1,4})\s+([A-Z][a-zA-Z\.\s\-']+?)\s*[,\-]\s*(.+)$/);
    if (!match) match = clean.match(/^(\d+)\.\s+([A-Z][a-zA-Z\.\s\-']+?)\s*[,\-]\s*(.+)$/);

    if (match) {
      const [, cardNumber, playerName, team] = match;
      if (/^(checklist|header|team card)/i.test(playerName)) continue;
      if (playerName.length < 2) continue;

      const cleanTeam = team.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s*RC\s*$/i, '').trim();
      const key = `${cardNumber}-${playerName}-${currentSubset}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const lineIsRookie = isRookie || /\bRC\b|\bRookie\b/i.test(clean);

      cards.push({
        cardNumber: cardNumber.trim(),
        playerName: playerName.trim(),
        team: cleanTeam,
        subsetName: currentSubset,
        isRookie: lineIsRookie,
        isAutograph: isAuto,
        isInsert,
      });
    }
  }

  return cards;
}

async function scrapeSet(url: string): Promise<number> {
  console.log(`\nProcessing: ${url}`);
  await delay(DELAY_MS);

  const html = await fetchPage(url);
  if (!html) {
    console.log('  Failed to fetch');
    return 0;
  }

  const metadata = parseSetMetadata(url, html);
  console.log(`  Set: ${metadata.name}`);
  console.log(`  Sport: ${metadata.sport}, Year: ${metadata.year}`);

  if (!metadata.name) return 0;

  const { data: existingSet } = await supabase
    .from('card_sets')
    .select('id')
    .eq('source_url', url)
    .single();

  let setId: string;

  if (existingSet) {
    setId = existingSet.id;
    console.log(`  Exists: ${setId}`);
  } else {
    const { data: newSet, error } = await supabase
      .from('card_sets')
      .insert({
        name: metadata.name,
        year: metadata.year,
        sport: metadata.sport,
        manufacturer: metadata.manufacturer,
        product_line: metadata.productLine,
        source_url: url,
      })
      .select('id')
      .single();

    if (error) {
      console.log(`  Error: ${error.message}`);
      return 0;
    }
    setId = newSet.id;
    console.log(`  Created: ${setId}`);
  }

  const cards = parseChecklist(html);
  console.log(`  Found ${cards.length} cards`);

  if (cards.length === 0) return 0;

  await supabase.from('card_catalog').delete().eq('set_id', setId);

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
  return cards.length;
}

async function discoverFromIndex(indexUrl: string): Promise<string[]> {
  console.log(`\nScanning index: ${indexUrl}`);
  const html = await fetchPage(indexUrl);
  if (!html) return [];

  const urls: string[] = [];
  const linkRegex = /href="(https:\/\/www\.beckett\.com\/news\/\d{4}[^"]*-cards[^"]*)"/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1].replace(/\/$/, '');
    if (!url.includes('release-dates') && !urls.includes(url)) {
      urls.push(url);
    }
  }

  console.log(`  Found ${urls.length} checklist URLs`);
  return urls;
}

async function main() {
  console.log('==========================================');
  console.log('  Beckett Recent Sets Scraper');
  console.log('  Focus: 2020+ Basketball, Football, Soccer');
  console.log('==========================================\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  let totalCards = 0;
  let totalSets = 0;
  const allUrls: string[] = [...DIRECT_URLS];

  // Discover from index pages
  for (const indexUrl of INDEX_PAGES) {
    const urls = await discoverFromIndex(indexUrl);
    for (const url of urls) {
      if (!allUrls.includes(url)) allUrls.push(url);
    }
    await delay(DELAY_MS);
  }

  console.log(`\n==========================================`);
  console.log(`Total URLs to scrape: ${allUrls.length}`);
  console.log(`==========================================\n`);

  for (const url of allUrls) {
    const cards = await scrapeSet(url);
    if (cards > 0) {
      totalCards += cards;
      totalSets++;
    }
  }

  const { count } = await supabase
    .from('card_catalog')
    .select('*', { count: 'exact', head: true });

  console.log(`\n==========================================`);
  console.log(`  COMPLETE`);
  console.log(`==========================================`);
  console.log(`  Sets scraped: ${totalSets}`);
  console.log(`  Cards added: ${totalCards}`);
  console.log(`  Total in DB: ${count}`);
  console.log(`==========================================`);
}

main().catch(console.error);
