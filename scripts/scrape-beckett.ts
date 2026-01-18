/**
 * Beckett Full Site Checklist Scraper
 * Scrapes ALL sports card checklists from Beckett.com
 * This is the source of truth for new releases
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DELAY_MS = 1500; // Be respectful

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Sport categories on Beckett
const SPORTS = [
  { name: 'soccer', urlPatterns: ['soccer', 'uefa', 'premier-league', 'mls', 'world-cup', 'futbol'] },
  { name: 'basketball', urlPatterns: ['basketball', 'nba', 'hoops'] },
  { name: 'football', urlPatterns: ['football', 'nfl'] },
  { name: 'baseball', urlPatterns: ['baseball', 'mlb'] },
  { name: 'hockey', urlPatterns: ['hockey', 'nhl'] },
  { name: 'ufc', urlPatterns: ['ufc', 'mma'] },
  { name: 'wrestling', urlPatterns: ['wrestling', 'wwe', 'aew'] },
  { name: 'golf', urlPatterns: ['golf', 'pga'] },
  { name: 'racing', urlPatterns: ['racing', 'nascar', 'f1', 'formula'] },
  { name: 'tennis', urlPatterns: ['tennis'] },
  { name: 'multi-sport', urlPatterns: ['multi-sport', 'olympic'] },
];

// Known release date index pages (these link to all checklists for a year/sport)
const RELEASE_INDEX_PATTERNS = [
  // These index pages contain links to all individual set checklists
  '2025-26-basketball-card-release-dates',
  '2025-26-hockey-card-release-dates',
  '2025-football-cards-release-dates',
  '2025-baseball-card-release-dates',
  '2025-soccer-card-release-dates',
  '2024-25-basketball-card-release-dates',
  '2024-25-hockey-card-release-dates',
  '2024-football-cards-release-dates',
  '2024-baseball-card-release-dates',
  '2024-soccer-card-release-dates',
];

// Entry point URLs to scan
const BECKETT_ENTRY_URLS = [
  'https://www.beckett.com/news/',
  'https://www.beckett.com/news/page/2/',
  'https://www.beckett.com/news/page/3/',
];

async function fetchPage(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
      if (response.ok) return await response.text();
      if (response.status === 404) return null;
      console.log(`  Retry ${i + 1}: Status ${response.status}`);
    } catch (e) {
      console.log(`  Retry ${i + 1}: Network error`);
    }
    await delay(DELAY_MS * 2);
  }
  return null;
}

function detectSport(url: string): string {
  const lower = url.toLowerCase();
  for (const sport of SPORTS) {
    for (const pattern of sport.urlPatterns) {
      if (lower.includes(pattern)) {
        return sport.name;
      }
    }
  }
  return 'other';
}

function parseSetMetadata(url: string, html: string) {
  // Extract year - handles "2025-26", "2024-25", "2024", etc.
  const yearMatch = url.match(/(\d{4}-\d{2}|\d{4})/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

  // Extract title from page
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    || html.match(/<title>([^<|–-]+)/i);
  let name = titleMatch ? titleMatch[1].trim() : '';
  name = name
    .replace(/\s*Checklist.*$/i, '')
    .replace(/\s*Cards\s*$/i, '')
    .replace(/\s*Set Review.*$/i, '')
    .trim();

  // Determine manufacturer
  let manufacturer = 'Unknown';
  const lower = (url + ' ' + name).toLowerCase();
  if (lower.includes('topps') || lower.includes('bowman') || lower.includes('chrome') || lower.includes('finest')) {
    manufacturer = 'Topps';
  } else if (lower.includes('panini') || lower.includes('prizm') || lower.includes('select') || lower.includes('mosaic') || lower.includes('donruss') || lower.includes('optic') || lower.includes('contenders') || lower.includes('national treasures') || lower.includes('flawless') || lower.includes('immaculate')) {
    manufacturer = 'Panini';
  } else if (lower.includes('upper deck') || lower.includes('upper-deck') || lower.includes('sp authentic') || lower.includes('exquisite')) {
    manufacturer = 'Upper Deck';
  } else if (lower.includes('leaf')) {
    manufacturer = 'Leaf';
  } else if (lower.includes('sage')) {
    manufacturer = 'Sage';
  } else if (lower.includes('press pass')) {
    manufacturer = 'Press Pass';
  }

  // Product line
  let productLine = '';
  const productPatterns = [
    'prizm', 'select', 'mosaic', 'optic', 'chrome', 'finest', 'bowman',
    'donruss', 'contenders', 'national treasures', 'flawless', 'immaculate',
    'spectra', 'obsidian', 'noir', 'one', 'origins', 'chronicles', 'absolute',
    'score', 'prestige', 'elite', 'certified', 'phoenix', 'limited',
    'heritage', 'archives', 'stadium club', 'gypsy queen', 'allen ginter',
    'topps', 'sp authentic', 'exquisite', 'the cup', 'artifacts', 'mvp',
    'series 1', 'series 2', 'update', 'opening day',
  ];
  for (const p of productPatterns) {
    if (lower.includes(p)) {
      productLine = p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  const sport = detectSport(url);

  return { name, year, manufacturer, productLine, sport };
}

interface CardEntry {
  cardNumber: string;
  playerName: string;
  team: string;
  subsetName: string;
  isRookie: boolean;
  isAutograph: boolean;
  isInsert: boolean;
  isParallel: boolean;
}

function parseChecklist(html: string): CardEntry[] {
  const cards: CardEntry[] = [];
  const seen = new Set<string>();

  // Clean HTML entities
  const text = html
    .replace(/&#8211;|–/g, '-')
    .replace(/&#8217;|&#8216;|'/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/div>/gi, '\n');

  let currentSubset = 'Base';
  let isRookie = false;
  let isAuto = false;
  let isInsert = false;
  let isParallel = false;

  const lines = text.split('\n');

  for (const line of lines) {
    const clean = line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean || clean.length < 3) continue;

    // Detect subset headers (usually short lines without card numbers)
    const isHeader = clean.length < 60 && !/^\d+\s|^[A-Z]+-[A-Z0-9]+\s/.test(clean);

    if (isHeader) {
      const lower = clean.toLowerCase();

      if (/^base\b|base set|base cards/i.test(clean)) {
        currentSubset = 'Base';
        isRookie = false; isAuto = false; isInsert = false; isParallel = false;
        continue;
      }
      if (/rookie|rc\b|future star|prospect/i.test(lower)) {
        currentSubset = clean.length < 40 ? clean : 'Rookies';
        isRookie = true; isAuto = false; isInsert = false;
        continue;
      }
      if (/autograph|auto\b|signature/i.test(lower)) {
        currentSubset = clean.length < 40 ? clean : 'Autographs';
        isAuto = true; isRookie = false; isInsert = false;
        continue;
      }
      if (/insert|variation/i.test(lower)) {
        currentSubset = clean.length < 40 ? clean : 'Inserts';
        isInsert = true; isAuto = false;
        continue;
      }
      if (/parallel|refractor|prizm|holo|foil|\/\d+/i.test(lower)) {
        isParallel = true;
        continue;
      }
      if (/memorabilia|relic|patch|jersey/i.test(lower)) {
        currentSubset = clean.length < 40 ? clean : 'Memorabilia';
        isInsert = true;
        continue;
      }
    }

    // Parse card entries

    // Format 1: "1 Player Name, Team" or "1 Player Name - Team"
    let match = clean.match(/^(\d+)\s+([A-Z][a-zA-Z\.\s\-']+?)\s*[,\-]\s*(.+)$/);

    // Format 2: "XX-AB Player Name, Team" (alphanumeric prefix)
    if (!match) {
      match = clean.match(/^([A-Z]{1,4}-?[A-Z0-9]{1,4})\s+([A-Z][a-zA-Z\.\s\-']+?)\s*[,\-]\s*(.+)$/);
    }

    // Format 3: "1. Player Name, Team" (numbered list)
    if (!match) {
      match = clean.match(/^(\d+)\.\s+([A-Z][a-zA-Z\.\s\-']+?)\s*[,\-]\s*(.+)$/);
    }

    // Format 4: Just "Player Name, Team" without number (use line count)
    if (!match && /^[A-Z][a-zA-Z\.\s\-']+,\s*.+$/.test(clean)) {
      match = clean.match(/^([A-Z][a-zA-Z\.\s\-']+?)\s*,\s*(.+)$/);
      if (match) {
        // Shift to make room for synthetic card number
        match = [clean, String(cards.length + 1), match[1], match[2]];
      }
    }

    if (match) {
      const [, cardNumber, playerName, team] = match;

      // Skip headers/non-player entries
      if (/^(checklist|header|team card|team logo|insert|parallel|variation)/i.test(playerName)) {
        continue;
      }
      if (playerName.length < 2) continue;

      // Clean team name
      const cleanTeam = team
        .replace(/\s*\([^)]*\)\s*$/, '') // Remove trailing parenthetical
        .replace(/\s*RC\s*$/i, '') // Remove RC suffix
        .trim();

      const key = `${cardNumber}-${playerName}-${currentSubset}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Check for rookie indicators in the line
      const lineIsRookie = isRookie || /\bRC\b|\bRookie\b/i.test(clean);

      cards.push({
        cardNumber: cardNumber.trim(),
        playerName: playerName.trim(),
        team: cleanTeam,
        subsetName: currentSubset,
        isRookie: lineIsRookie,
        isAutograph: isAuto,
        isInsert,
        isParallel,
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
    console.log('  Failed to fetch page');
    return 0;
  }

  const metadata = parseSetMetadata(url, html);
  console.log(`  Set: ${metadata.name}`);
  console.log(`  Sport: ${metadata.sport}, Year: ${metadata.year}, Manufacturer: ${metadata.manufacturer}`);

  if (!metadata.name) {
    console.log('  Skipping - could not parse set name');
    return 0;
  }

  // Check if set exists
  const { data: existingSet } = await supabase
    .from('card_sets')
    .select('id')
    .eq('source_url', url)
    .single();

  let setId: string;

  if (existingSet) {
    setId = existingSet.id;
    console.log(`  Set exists: ${setId}`);
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
      console.log(`  Error creating set: ${error.message}`);
      return 0;
    }
    setId = newSet.id;
    console.log(`  Created set: ${setId}`);
  }

  const cards = parseChecklist(html);
  console.log(`  Found ${cards.length} cards`);

  if (cards.length === 0) return 0;

  // Delete existing cards and re-insert
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
      is_parallel: c.isParallel,
    }));
    await supabase.from('card_catalog').insert(batch);
  }

  console.log(`  Inserted ${cards.length} cards`);
  return cards.length;
}

async function discoverChecklistUrls(): Promise<{ checklists: string[]; indexPages: string[] }> {
  const checklists: string[] = [];
  const indexPages: string[] = [];
  const seen = new Set<string>();

  // Scan entry URLs for links
  for (const entryUrl of BECKETT_ENTRY_URLS) {
    console.log(`Scanning: ${entryUrl}`);
    const html = await fetchPage(entryUrl);
    if (!html) continue;

    // Find all Beckett news links
    const linkRegex = /href="(https:\/\/www\.beckett\.com\/news\/[^"]+)"/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1].replace(/\/$/, ''); // Normalize trailing slash
      if (seen.has(url)) continue;
      seen.add(url);

      // Check if it's a release dates index page
      const isIndex = RELEASE_INDEX_PATTERNS.some(p => url.includes(p)) ||
                      url.includes('release-dates-checklists');
      if (isIndex) {
        indexPages.push(url);
        console.log(`  Found index: ${url.split('/').pop()}`);
        continue;
      }

      // Check if it's a checklist page (contains year and ends with -cards)
      if (/\/\d{4}/.test(url) && url.includes('-cards') && !url.includes('release-dates')) {
        checklists.push(url);
      }
    }

    await delay(DELAY_MS);
  }

  // Now follow each index page to find more checklists
  console.log(`\nFollowing ${indexPages.length} index pages...`);
  for (const indexUrl of indexPages) {
    console.log(`\nIndex: ${indexUrl.split('/').pop()}`);
    const html = await fetchPage(indexUrl);
    if (!html) continue;

    // Find checklist links within the index page
    const linkRegex = /href="(https:\/\/www\.beckett\.com\/news\/\d{4}[^"]*-cards[^"]*)"/gi;
    let match;
    let count = 0;

    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1].replace(/\/$/, '');
      if (seen.has(url)) continue;
      if (url.includes('release-dates')) continue; // Skip other index pages
      seen.add(url);
      checklists.push(url);
      count++;
    }
    console.log(`  Found ${count} checklist URLs`);

    await delay(DELAY_MS);
  }

  return { checklists, indexPages };
}

async function main() {
  console.log('==========================================');
  console.log('  Beckett Full Site Checklist Scraper');
  console.log('==========================================\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  let totalCards = 0;
  let totalSets = 0;

  // Phase 1: Discover checklist URLs from news pages and index pages
  console.log('Phase 1: Discovering checklist URLs...\n');
  const { checklists, indexPages } = await discoverChecklistUrls();

  console.log(`\n==========================================`);
  console.log(`Found ${indexPages.length} index pages`);
  console.log(`Discovered ${checklists.length} total checklist URLs`);
  console.log(`==========================================\n`);

  if (checklists.length === 0) {
    console.log('No checklists found. Exiting.');
    return;
  }

  // Phase 2: Scrape each checklist
  console.log('Phase 2: Scraping checklists...\n');

  // Prioritize soccer (user's preference)
  const soccerFirst = checklists.sort((a, b) => {
    const aIsSoccer = /soccer|uefa|premier|mls|futbol/i.test(a) ? 0 : 1;
    const bIsSoccer = /soccer|uefa|premier|mls|futbol/i.test(b) ? 0 : 1;
    return aIsSoccer - bIsSoccer;
  });

  for (const url of soccerFirst) {
    const cards = await scrapeSet(url);
    if (cards > 0) {
      totalCards += cards;
      totalSets++;
    }
  }

  // Final stats
  const { count } = await supabase
    .from('card_catalog')
    .select('*', { count: 'exact', head: true });

  console.log(`\n==========================================`);
  console.log(`  SCRAPE COMPLETE`);
  console.log(`==========================================`);
  console.log(`  Sets scraped this run: ${totalSets}`);
  console.log(`  Cards added this run: ${totalCards}`);
  console.log(`  Total cards in DB: ${count}`);
  console.log(`==========================================`);
}

main().catch(console.error);
