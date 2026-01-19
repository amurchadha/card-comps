/**
 * Cardboard Connection - FULL SITE Scraper
 * Scrapes ALL sports: Baseball, Football, Basketball, Soccer, Hockey, UFC, Wrestling, etc.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BASE_URL = 'https://www.cardboardconnection.com';
const DELAY_MS = 800;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// All sports categories on Cardboard Connection
const SPORTS_CATEGORIES = [
  { sport: 'baseball', path: '/sports-cards-sets/mlb-baseball-cards' },
  { sport: 'football', path: '/sports-cards-sets/nfl-football-cards' },
  { sport: 'basketball', path: '/sports-cards-sets/nba-basketball-cards' },
  { sport: 'soccer', path: '/sports-cards-sets/soccer-card-sets' },
  { sport: 'hockey', path: '/sports-cards-sets/hockey-card-sets' },
  { sport: 'hockey', path: '/sports-cards-sets/nhl-hockey-cards' },
  { sport: 'ufc', path: '/sports-cards-sets/ufc-mma-cards' },
  { sport: 'wrestling', path: '/sports-cards-sets/wrestling-cards' },
  { sport: 'golf', path: '/sports-cards-sets/golf-cards' },
  { sport: 'racing', path: '/sports-cards-sets/racing-cards' },
  { sport: 'tennis', path: '/sports-cards-sets/tennis-cards' },
  { sport: 'multi-sport', path: '/sports-cards-sets/multi-sport-cards' },
];

// Year page URL patterns per sport
const YEAR_PATTERNS: Record<string, (year: string) => string[]> = {
  baseball: (year) => [
    `/sports-cards-sets/mlb-baseball-cards/${year}-baseball-cards`,
  ],
  football: (year) => [
    `/sports-cards-sets/nfl-football-cards/${year}-football-cards`,
  ],
  basketball: (year) => [
    `/sports-cards-sets/nba-basketball-cards/${year}-${parseInt(year)+1}-basketball-cards`,
    `/sports-cards-sets/nba-basketball-cards/${year}-basketball-cards`,
  ],
  soccer: (year) => [
    `/sports-cards-sets/soccer-card-sets/${year}-soccer-cards`,
    `/sports-cards-sets/soccer-card-sets/${year}-${String(parseInt(year)+1).slice(-2)}-soccer-cards`,
  ],
  hockey: (year) => [
    `/sports-cards-sets/hockey-card-sets/${year}-hockey-cards`,
    `/sports-cards-sets/nhl-hockey-cards/${year}-${String(parseInt(year)+1).slice(-2)}-hockey-cards`,
  ],
};

// Years to check for each sport
const YEARS = Array.from({ length: 80 }, (_, i) => String(2026 - i)); // 2026 down to 1947

const seen = new Set<string>();
let totalCardsInserted = 0;
let totalSetsProcessed = 0;

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
      console.log(`  [${response.status}] ${url}`);
    } catch (e) {
      console.log(`  [Error] ${url}: ${e}`);
    }
    await delay(DELAY_MS * (i + 1));
  }
  return null;
}

function extractAllSetUrls(html: string): string[] {
  const urls: string[] = [];
  // Match any checklist/review URL
  const patterns = [
    /href="(https:\/\/www\.cardboardconnection\.com\/\d{4}[^"]*(?:checklist|review|cards)[^"]*)"/gi,
    /href="(https:\/\/www\.cardboardconnection\.com\/[^"]*\d{4}[^"]*cards[^"]*)"/gi,
  ];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[1];
      // Skip non-checklist pages
      if (url.includes('/category/') || url.includes('/tag/') || url.includes('/page/')) continue;
      if (url.includes('#')) continue;
      if (!urls.includes(url) && !seen.has(url)) {
        urls.push(url);
      }
    }
  }
  return urls;
}

function detectSport(url: string, html: string): string {
  const lower = (url + ' ' + html.slice(0, 5000)).toLowerCase();

  if (lower.includes('baseball') || lower.includes('mlb') || lower.includes('topps-series') || lower.includes('bowman')) return 'baseball';
  if (lower.includes('football') || lower.includes('nfl') || lower.includes('panini-score') || lower.includes('prizm-football')) return 'football';
  if (lower.includes('basketball') || lower.includes('nba') || lower.includes('hoops')) return 'basketball';
  if (lower.includes('soccer') || lower.includes('fifa') || lower.includes('premier-league') || lower.includes('uefa') || lower.includes('mls')) return 'soccer';
  if (lower.includes('hockey') || lower.includes('nhl') || lower.includes('upper-deck-hockey')) return 'hockey';
  if (lower.includes('ufc') || lower.includes('mma')) return 'ufc';
  if (lower.includes('wrestling') || lower.includes('wwe') || lower.includes('aew')) return 'wrestling';
  if (lower.includes('golf') || lower.includes('pga')) return 'golf';
  if (lower.includes('racing') || lower.includes('nascar') || lower.includes('f1') || lower.includes('formula')) return 'racing';
  if (lower.includes('tennis') || lower.includes('atp') || lower.includes('wta')) return 'tennis';

  return 'other';
}

function parseSetMetadata(url: string, html: string) {
  // Extract year from URL or title
  const yearMatch = url.match(/\/(\d{4})[-\/]/) || html.match(/<title>(\d{4})/);
  const year = yearMatch ? yearMatch[1] : '';

  // Extract set name from title
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/<title>([^<|–-]+)/i);
  let name = titleMatch ? titleMatch[1].trim() : '';
  name = name.replace(/\s*(Checklist|Review|and Checklist|Set Review|Cards Checklist|[\|–-].*)/gi, '').trim();

  // Detect manufacturer
  const lower = (url + name).toLowerCase();
  let manufacturer = 'Unknown';
  if (lower.includes('panini') || lower.includes('prizm') || lower.includes('donruss') || lower.includes('select') || lower.includes('mosaic') || lower.includes('optic') || lower.includes('contenders') || lower.includes('chronicles') || lower.includes('obsidian') || lower.includes('immaculate') || lower.includes('national-treasures') || lower.includes('flawless')) {
    manufacturer = 'Panini';
  } else if (lower.includes('topps') || lower.includes('bowman') || lower.includes('chrome') || lower.includes('stadium-club') || lower.includes('heritage') || lower.includes('finest') || lower.includes('gypsy-queen') || lower.includes('allen-ginter') || lower.includes('archives')) {
    manufacturer = 'Topps';
  } else if (lower.includes('upper-deck') || lower.includes('sp-authentic') || lower.includes('exquisite')) {
    manufacturer = 'Upper Deck';
  } else if (lower.includes('leaf')) {
    manufacturer = 'Leaf';
  } else if (lower.includes('sage') || lower.includes('hit')) {
    manufacturer = 'SAGE';
  } else if (lower.includes('press-pass')) {
    manufacturer = 'Press Pass';
  } else if (lower.includes('fleer') || lower.includes('skybox')) {
    manufacturer = 'Fleer/Skybox';
  }

  // Detect product line
  let productLine = '';
  const productPatterns = [
    'prizm', 'select', 'mosaic', 'optic', 'donruss', 'chronicles', 'obsidian',
    'immaculate', 'national-treasures', 'flawless', 'contenders', 'playoff',
    'chrome', 'bowman', 'heritage', 'stadium-club', 'finest', 'archives',
    'gypsy-queen', 'allen-ginter', 'triple-threads', 'dynasty', 'definitive',
    'sp-authentic', 'the-cup', 'exquisite', 'black-diamond'
  ];
  for (const p of productPatterns) {
    if (lower.includes(p)) {
      productLine = p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
  parallelName: string;
  printRun: number | null;
  isRookie: boolean;
  isAutograph: boolean;
  isInsert: boolean;
  isParallel: boolean;
}

function parseChecklist(html: string): CardEntry[] {
  const cards: CardEntry[] = [];
  const seenCards = new Set<string>();

  // Clean HTML entities
  let text = html
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Split by common delimiters
  const lines = text.split(/<br\s*\/?>/gi);

  let currentSubset = 'Base';
  let isRookie = false;
  let isAuto = false;
  let isInsert = false;
  let isParallel = false;
  let parallelName = '';
  let printRun: number | null = null;

  for (const line of lines) {
    const clean = line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean || clean.length < 3) continue;

    // Detect subset headers
    const lowerClean = clean.toLowerCase();

    // Check for subset/insert headers (usually short lines without card numbers)
    if (clean.length < 100 && !/^\d+\s+[A-Z]/.test(clean)) {
      // Base set indicators
      if (/^(base\s*(set|cards?)|checklist|veteran)/i.test(clean)) {
        currentSubset = 'Base';
        isRookie = false; isAuto = false; isInsert = false; isParallel = false;
        parallelName = ''; printRun = null;
        continue;
      }

      // Rookie indicators
      if (/^(rookie|rc|rated rookie|1st bowman)/i.test(clean) && !/\d+\s+\w/.test(clean)) {
        currentSubset = 'Rookies';
        isRookie = true; isAuto = false; isInsert = false; isParallel = false;
        parallelName = ''; printRun = null;
        continue;
      }

      // Autograph indicators
      if (/(autograph|signature|auto\b|signed)/i.test(clean) && !/\d+\s+\w/.test(clean)) {
        currentSubset = clean.length < 60 ? clean.replace(/<[^>]+>/g, '').trim() : 'Autographs';
        isRookie = false; isAuto = true; isInsert = false; isParallel = false;
        parallelName = ''; printRun = null;
        continue;
      }

      // Insert indicators
      if (/(insert|memorabilia|relic|patch|jersey|bat|game-used)/i.test(clean) && !/\d+\s+\w/.test(clean)) {
        currentSubset = clean.length < 60 ? clean.replace(/<[^>]+>/g, '').trim() : 'Inserts';
        isRookie = false; isAuto = false; isInsert = true; isParallel = false;
        parallelName = ''; printRun = null;
        continue;
      }

      // Parallel indicators
      const parallelMatch = clean.match(/^(gold|silver|red|blue|green|orange|purple|pink|black|white|refractor|prizm|holo|shimmer|wave|camo|cracked ice|mojo|xfractor|superfractor|atomic|hyper|velocity|disco|ice|peacock|tiger|snakeskin|scope|nebula|pulsar|fotl|first off the line)[^a-z]*(?:\/(\d+))?/i);
      if (parallelMatch) {
        parallelName = parallelMatch[1];
        printRun = parallelMatch[2] ? parseInt(parallelMatch[2]) : null;
        isParallel = true;
        continue;
      }

      // Numbered parallel indicators like "/99" or "#/25"
      const numberedMatch = clean.match(/^(?:#|numbered\s*)?\/(\d+)/i);
      if (numberedMatch) {
        printRun = parseInt(numberedMatch[1]);
        isParallel = true;
        continue;
      }
    }

    // Parse card entries - various formats
    // Format 1: "123 Player Name - Team"
    // Format 2: "123 Player Name"
    // Format 3: "#123 Player Name"

    const cardPatterns = [
      /^#?(\d+[a-zA-Z]?)\s+([A-Z][a-zA-Z\.\s\-']+?(?:\s+(?:Jr\.|Sr\.|III|II|IV))?)\s*[-–]\s*(.+)$/,
      /^#?(\d+[a-zA-Z]?)\s+([A-Z][a-zA-Z\.\s\-']{2,40})$/,
    ];

    for (const pattern of cardPatterns) {
      const cardMatch = clean.match(pattern);
      if (cardMatch) {
        const cardNumber = cardMatch[1].trim();
        let playerName = cardMatch[2].trim();
        const team = cardMatch[3]?.trim() || '';

        // Skip non-player entries
        if (playerName.length < 2) continue;
        if (/^(checklist|header|team|logo|puzzle|promo|nno|coa)/i.test(playerName)) continue;

        // Check for RC indicator in name
        let cardIsRookie = isRookie;
        if (/\bRC\b|\bRookie\b/i.test(playerName)) {
          cardIsRookie = true;
          playerName = playerName.replace(/\s*\bRC\b\s*/gi, ' ').replace(/\s*\bRookie\b\s*/gi, ' ').trim();
        }

        // Check for AUTO indicator in name
        let cardIsAuto = isAuto;
        if (/\bAU\b|\bAUTO\b|\bAutograph\b/i.test(clean)) {
          cardIsAuto = true;
        }

        // Dedup key
        const key = `${cardNumber}-${playerName}-${currentSubset}-${parallelName}`;
        if (seenCards.has(key)) continue;
        seenCards.add(key);

        cards.push({
          cardNumber,
          playerName,
          team,
          subsetName: currentSubset,
          parallelName: parallelName || '',
          printRun,
          isRookie: cardIsRookie,
          isAutograph: cardIsAuto,
          isInsert,
          isParallel,
        });
        break;
      }
    }
  }

  return cards;
}

async function processSetUrl(url: string, sport: string) {
  if (seen.has(url)) return;
  seen.add(url);

  console.log(`\n[${sport.toUpperCase()}] ${url}`);
  await delay(DELAY_MS);

  const html = await fetchPage(url);
  if (!html) {
    console.log('  ✗ Failed to fetch');
    return;
  }

  // Auto-detect sport if not specified
  if (sport === 'unknown') {
    sport = detectSport(url, html);
  }

  const metadata = parseSetMetadata(url, html);
  if (!metadata.name || !metadata.year) {
    console.log('  ✗ Could not parse metadata');
    return;
  }

  console.log(`  Set: ${metadata.year} ${metadata.name}`);

  // Check if set exists
  const { data: existingSet } = await supabase
    .from('card_sets')
    .select('id')
    .eq('source_url', url)
    .single();

  let setId: string;

  if (existingSet) {
    setId = existingSet.id;
    console.log(`  → Existing set: ${setId}`);
  } else {
    const { data: newSet, error } = await supabase
      .from('card_sets')
      .insert({
        name: metadata.name,
        year: metadata.year,
        sport,
        manufacturer: metadata.manufacturer,
        product_line: metadata.productLine,
        source_url: url,
      })
      .select('id')
      .single();

    if (error) {
      console.log(`  ✗ DB Error: ${error.message}`);
      return;
    }
    setId = newSet.id;
    console.log(`  → Created set: ${setId}`);
  }

  // Parse checklist
  const cards = parseChecklist(html);
  console.log(`  Found ${cards.length} cards`);

  if (cards.length === 0) return;

  // Delete existing cards for this set and insert new ones
  await supabase.from('card_catalog').delete().eq('set_id', setId);

  // Insert in batches
  for (let i = 0; i < cards.length; i += 100) {
    const batch = cards.slice(i, i + 100).map(c => ({
      set_id: setId,
      card_number: c.cardNumber,
      player_name: c.playerName,
      team: c.team,
      subset_name: c.subsetName,
      parallel_name: c.parallelName || null,
      print_run: c.printRun,
      is_rookie: c.isRookie,
      is_autograph: c.isAutograph,
      is_insert: c.isInsert,
    }));

    const { error } = await supabase.from('card_catalog').insert(batch);
    if (error) {
      console.log(`  ✗ Insert error: ${error.message}`);
    }
  }

  totalCardsInserted += cards.length;
  totalSetsProcessed++;
  console.log(`  ✓ Inserted ${cards.length} cards (Total: ${totalCardsInserted.toLocaleString()})`);
}

async function crawlCategoryPage(url: string, sport: string) {
  console.log(`\n=== Crawling: ${url} ===`);
  const html = await fetchPage(url);
  if (!html) {
    console.log('Failed to fetch category page');
    return;
  }

  const setUrls = extractAllSetUrls(html);
  console.log(`Found ${setUrls.length} set URLs`);

  for (const setUrl of setUrls) {
    await processSetUrl(setUrl, sport);
  }

  // Check for pagination
  const nextPageMatch = html.match(/href="([^"]+page\/\d+[^"]*)"/);
  if (nextPageMatch && !seen.has(nextPageMatch[1])) {
    await delay(DELAY_MS);
    await crawlCategoryPage(nextPageMatch[1], sport);
  }
}

async function crawlYearPages(sport: string) {
  const patternFn = YEAR_PATTERNS[sport];
  if (!patternFn) return;

  for (const year of YEARS) {
    const yearUrls = patternFn(year);

    for (const path of yearUrls) {
      const url = `${BASE_URL}${path}`;
      if (seen.has(url)) continue;
      seen.add(url);

      const html = await fetchPage(url);
      if (!html) continue;

      console.log(`\n=== ${year} ${sport.toUpperCase()} ===`);
      const setUrls = extractAllSetUrls(html);
      console.log(`Found ${setUrls.length} sets`);

      for (const setUrl of setUrls) {
        await processSetUrl(setUrl, sport);
      }
    }
  }
}

async function crawlSitemap() {
  console.log('\n=== Checking sitemap ===');
  const sitemapUrls = [
    `${BASE_URL}/sitemap.xml`,
    `${BASE_URL}/sitemap_index.xml`,
    `${BASE_URL}/post-sitemap.xml`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    const xml = await fetchPage(sitemapUrl);
    if (!xml) continue;

    // Extract URLs from sitemap
    const urlMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/gi);
    for (const match of urlMatches) {
      const url = match[1];
      if (url.includes('checklist') || url.includes('cards')) {
        if (!seen.has(url) && /\d{4}/.test(url)) {
          await processSetUrl(url, 'unknown');
        }
      }
    }
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Cardboard Connection - FULL SITE SCRAPER        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const startTime = Date.now();

  // 1. Crawl main category pages
  for (const { sport, path } of SPORTS_CATEGORIES) {
    await crawlCategoryPage(`${BASE_URL}${path}`, sport);
  }

  // 2. Crawl year-specific pages for sports with year patterns
  const sportsWithYearPatterns = [...new Set(Object.keys(YEAR_PATTERNS))];
  for (const sport of sportsWithYearPatterns) {
    await crawlYearPages(sport);
  }

  // 3. Check sitemap for anything we missed
  await crawlSitemap();

  // Final stats
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const { count } = await supabase.from('card_catalog').select('*', { count: 'exact', head: true });
  const { count: setCount } = await supabase.from('card_sets').select('*', { count: 'exact', head: true });

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  SCRAPE COMPLETE                                 ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Duration: ${duration} minutes`);
  console.log(`║  Sets processed this run: ${totalSetsProcessed.toLocaleString()}`);
  console.log(`║  Cards inserted this run: ${totalCardsInserted.toLocaleString()}`);
  console.log(`║  Total sets in DB: ${setCount?.toLocaleString()}`);
  console.log(`║  Total cards in DB: ${count?.toLocaleString()}`);
  console.log('╚══════════════════════════════════════════════════╝');
}

main().catch(console.error);
