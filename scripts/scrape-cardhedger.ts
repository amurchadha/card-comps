#!/usr/bin/env npx tsx
/**
 * CardHedger API Scraper
 *
 * Scrapes the CardHedger API to pull all card data into our database.
 *
 * Usage:
 *   CARDHEDGER_API_KEY=your_key npx tsx scripts/scrape-cardhedger.ts
 *
 * Options:
 *   --dry-run     Don't insert into DB, just log what would be inserted
 *   --category=X  Only scrape specific category (baseball, basketball, football, soccer, hockey, pokemon, etc.)
 *   --resume      Resume from last saved position
 *   --test        Just test API connectivity with a sample query
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Config
const API_KEY = process.env.CARDHEDGER_API_KEY;
const API_URL = 'https://cardhedge-api.com/v1/cards/search';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ghdqbnjsfhjgyqlktfud.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Rate limiting - start conservative, adjust based on their limits
const REQUESTS_PER_MINUTE = 30;
const DELAY_MS = Math.ceil(60000 / REQUESTS_PER_MINUTE);
const BATCH_SIZE = 100; // Cards per request

// Progress tracking
const PROGRESS_FILE = '/home/aaron/projects/card-comps/scripts/.cardhedger-progress.json';

interface ProgressState {
  currentCategory: string;
  currentYear: number;
  currentOffset: number;
  totalCards: number;
  queriesRun: number;
  startedAt: string;
  lastUpdated: string;
  completedCategories: string[];
}

interface CardHedgerPrices {
  PSA_10?: number;
  PSA_9?: number;
  PSA_8?: number;
  BGS_10?: number;
  BGS_9_5?: number;
  BGS_9?: number;
  SGC_10?: number;
  SGC_9?: number;
  RAW?: number;
  [key: string]: number | undefined;
}

interface CardHedgerMarketData {
  '30_day_change'?: string;
  '90_day_change'?: string;
  '1_year_change'?: string;
  volume_last_30_days?: number;
  market_cap?: string;
}

interface CardHedgerLastSale {
  price?: number;
  grade?: string;
  date?: string;
  marketplace?: string;
  auction_id?: string;
}

interface CardHedgerPopulation {
  PSA_10?: number;
  PSA_9?: number;
  PSA_8?: number;
  BGS_10?: number;
  BGS_9_5?: number;
  [key: string]: number | undefined;
}

interface CardHedgerCard {
  id?: string;
  player?: string;
  year?: number;
  set_name?: string;
  card_number?: string;
  category?: string;
  rookie?: boolean;
  parallel?: string;
  variation?: string;
  print_run?: number;
  prices?: CardHedgerPrices;
  market_data?: CardHedgerMarketData;
  last_sale?: CardHedgerLastSale;
  image_url?: string;
  population_report?: CardHedgerPopulation;
  [key: string]: unknown;
}

interface ApiResponse {
  success: boolean;
  data?: {
    cards: CardHedgerCard[];
    total_results: number;
    page: number;
    per_page: number;
  };
  error?: string;
  response_time_ms?: number;
}

// Parse args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const RESUME = args.includes('--resume');
const TEST_MODE = args.includes('--test');
const categoryArg = args.find(a => a.startsWith('--category='));
const CATEGORY_FILTER = categoryArg ? categoryArg.split('=')[1] : null;

// Search strategies - we'll iterate through these to get comprehensive data
const CATEGORIES = [
  { name: 'baseball', searches: ['Topps', 'Bowman', 'Panini', 'Upper Deck', 'Donruss', 'Fleer'] },
  { name: 'basketball', searches: ['Prizm', 'Select', 'Optic', 'Mosaic', 'Hoops', 'Topps Chrome'] },
  { name: 'football', searches: ['Prizm', 'Select', 'Optic', 'Mosaic', 'Contenders', 'National Treasures'] },
  { name: 'soccer', searches: ['Topps Chrome', 'Prizm', 'Select', 'Merlin', 'Finest', 'Match Attax'] },
  { name: 'hockey', searches: ['Upper Deck', 'O-Pee-Chee', 'SP Authentic', 'Young Guns'] },
  { name: 'pokemon', searches: ['Base Set', 'Jungle', 'Fossil', 'Scarlet Violet', '151', 'VMAX'] },
  { name: 'magic', searches: ['Alpha', 'Beta', 'Unlimited', 'Revised', 'Modern Horizons'] },
  { name: 'ufc', searches: ['Topps Chrome', 'Prizm', 'Select', 'Panini'] },
  { name: 'f1', searches: ['Topps Chrome', 'Turbo Attax', 'Topps F1'] },
];

// Years to search (recent years have more data)
const YEARS = Array.from({ length: 35 }, (_, i) => 2025 - i); // 2025 down to 1990

let supabase: ReturnType<typeof createClient> | null = null;
let stats = { inserted: 0, duplicates: 0, errors: 0 };

function loadProgress(): ProgressState | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading progress:', e);
  }
  return null;
}

function saveProgress(state: ProgressState) {
  state.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state, null, 2));
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface SearchResult {
  cards: CardHedgerCard[];
  totalResults: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

async function searchCards(query: string, limit: number = BATCH_SIZE, page: number = 1): Promise<SearchResult> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      limit,
      page
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text.slice(0, 200)}`);
  }

  const json: ApiResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(`API returned error: ${json.error || 'Unknown error'}`);
  }

  const { cards, total_results, page: currentPage, per_page } = json.data;
  const hasMore = currentPage * per_page < total_results;

  return {
    cards,
    totalResults: total_results,
    page: currentPage,
    perPage: per_page,
    hasMore
  };
}

interface NormalizedCard {
  // Card identification
  source_id: string | null;
  player_name: string;
  year: number | null;
  set_name: string;
  card_number: string | null;
  parallel: string | null;
  sport: string;
  is_rookie: boolean;
  print_run: number | null;
  image_url: string | null;
  // Pricing
  price_raw: number | null;
  price_psa_10: number | null;
  price_psa_9: number | null;
  price_psa_8: number | null;
  price_bgs_10: number | null;
  price_bgs_9_5: number | null;
  price_bgs_9: number | null;
  price_sgc_10: number | null;
  price_sgc_9: number | null;
  // Market data
  last_sale_price: number | null;
  last_sale_date: string | null;
  last_sale_grade: string | null;
  last_sale_marketplace: string | null;
  last_sale_auction_id: string | null;
  change_30d: string | null;
  change_90d: string | null;
  change_1y: string | null;
  volume_30d: number | null;
  market_cap: string | null;
  // Population
  pop_psa_10: number | null;
  pop_psa_9: number | null;
  pop_psa_8: number | null;
  pop_bgs_10: number | null;
  pop_bgs_9_5: number | null;
  pop_bgs_9: number | null;
  pop_sgc_10: number | null;
  // Source
  source: string;
  raw_data: Record<string, unknown>;
}

function normalizeCard(card: CardHedgerCard): NormalizedCard {
  const prices = card.prices || {};
  const market = card.market_data || {};
  const lastSale = card.last_sale || {};
  const pop = card.population_report || {};

  return {
    // Card identification
    source_id: card.id || null,
    player_name: card.player || 'Unknown',
    year: card.year || null,
    set_name: card.set_name || 'Unknown Set',
    card_number: card.card_number || null,
    parallel: card.parallel || card.variation || null,
    sport: (card.category || 'unknown').toLowerCase(),
    is_rookie: card.rookie || false,
    print_run: card.print_run || null,
    image_url: card.image_url || null,
    // Pricing by grade
    price_raw: prices.RAW || null,
    price_psa_10: prices.PSA_10 || null,
    price_psa_9: prices.PSA_9 || null,
    price_psa_8: prices.PSA_8 || null,
    price_bgs_10: prices.BGS_10 || null,
    price_bgs_9_5: prices.BGS_9_5 || null,
    price_bgs_9: prices.BGS_9 || null,
    price_sgc_10: prices.SGC_10 || null,
    price_sgc_9: prices.SGC_9 || null,
    // Last sale info
    last_sale_price: lastSale.price || null,
    last_sale_date: lastSale.date || null,
    last_sale_grade: lastSale.grade || null,
    last_sale_marketplace: lastSale.marketplace || null,
    last_sale_auction_id: lastSale.auction_id || null,
    // Market trends
    change_30d: market['30_day_change'] || null,
    change_90d: market['90_day_change'] || null,
    change_1y: market['1_year_change'] || null,
    volume_30d: market.volume_last_30_days || null,
    market_cap: market.market_cap || null,
    // Population reports
    pop_psa_10: pop.PSA_10 || null,
    pop_psa_9: pop.PSA_9 || null,
    pop_psa_8: pop.PSA_8 || null,
    pop_bgs_10: pop.BGS_10 || null,
    pop_bgs_9_5: pop.BGS_9_5 || null,
    pop_bgs_9: pop.BGS_9 || null,
    pop_sgc_10: pop.SGC_10 || null,
    // Source tracking
    source: 'cardhedger',
    raw_data: card as Record<string, unknown>
  };
}

async function insertCards(cards: CardHedgerCard[]): Promise<number> {
  if (cards.length === 0) return 0;

  if (!supabase || DRY_RUN) {
    console.log(`    [DRY RUN] Would insert ${cards.length} cards`);
    return cards.length;
  }

  const normalized = cards.map(c => normalizeCard(c));

  // Upsert into card_prices table, update on source_id conflict
  const { error, count } = await supabase
    .from('card_prices')
    .upsert(normalized, {
      onConflict: 'source_id',
      ignoreDuplicates: false  // Update existing records with new prices
    });

  if (error) {
    console.error('    Insert error:', error.message);
    stats.errors++;
    return 0;
  }

  return count || normalized.length;
}

async function scrapeWithQuery(query: string, progress: ProgressState): Promise<number> {
  let totalFound = 0;
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const result = await searchCards(query, BATCH_SIZE, page);

      if (result.cards.length === 0) {
        break;
      }

      totalFound += result.cards.length;
      const inserted = await insertCards(result.cards);
      stats.inserted += inserted;

      const pagesTotal = Math.ceil(result.totalResults / result.perPage);
      console.log(`    ${query} [page ${page}/${pagesTotal}]: ${result.cards.length} found, ${inserted} inserted (${result.totalResults} total)`);

      hasMore = result.hasMore;
      page++;

      progress.currentOffset = page;
      progress.queriesRun++;
      saveProgress(progress);

      await sleep(DELAY_MS);

    } catch (error) {
      console.error(`    Error: ${error}`);
      stats.errors++;
      await sleep(5000); // Back off on error
      break; // Move to next query
    }
  }

  return totalFound;
}

async function scrapeCategory(category: { name: string; searches: string[] }, progress: ProgressState): Promise<number> {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Scraping: ${category.name.toUpperCase()}`);
  console.log('='.repeat(50));

  let totalForCategory = 0;

  // Strategy 1: Search by set name + year
  for (const setSearch of category.searches) {
    for (const year of YEARS) {
      const query = `${year} ${setSearch} ${category.name}`;
      console.log(`  Query: "${query}"`);

      progress.currentCategory = category.name;
      progress.currentYear = year;

      const found = await scrapeWithQuery(query, progress);
      totalForCategory += found;

      // If we got no results for recent years, skip older years for this set
      if (found === 0 && year > 2015) {
        // Still try a few more years before giving up
      } else if (found === 0 && year <= 2015) {
        console.log(`    Skipping older years for ${setSearch}`);
        break;
      }
    }
  }

  // Strategy 2: Search for top players in this category
  const topPlayers: Record<string, string[]> = {
    baseball: ['Ohtani', 'Trout', 'Soto', 'Acuna', 'Judge', 'Tatis', 'Wander Franco', 'Skenes'],
    basketball: ['Wembanyama', 'Holmgren', 'Luka', 'Giannis', 'LeBron', 'Curry', 'Jordan'],
    football: ['Mahomes', 'Burrow', 'Stroud', 'Caleb Williams', 'Herbert', 'Allen'],
    soccer: ['Bellingham', 'Haaland', 'Mbappe', 'Yamal', 'Vinicius', 'Saka', 'Foden'],
    hockey: ['Bedard', 'McDavid', 'Crosby', 'Ovechkin', 'Matthews'],
    pokemon: ['Charizard', 'Pikachu', 'Mewtwo', 'Umbreon', 'Gengar'],
    ufc: ['McGregor', 'Jones', 'Makhachev', 'Adesanya'],
    f1: ['Verstappen', 'Hamilton', 'Leclerc', 'Norris'],
  };

  const players = topPlayers[category.name] || [];
  for (const player of players) {
    console.log(`  Player search: "${player}"`);
    const found = await scrapeWithQuery(player, progress);
    totalForCategory += found;
  }

  progress.completedCategories.push(category.name);
  saveProgress(progress);

  console.log(`\n  ${category.name} total: ${totalForCategory} cards`);
  return totalForCategory;
}

async function testApi() {
  console.log('Testing CardHedger API...\n');

  const testQueries = [
    'Michael Jordan 1986 Fleer',
    '2023 Topps Chrome Ohtani',
    'Charizard Base Set',
    'Prizm Wembanyama'
  ];

  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    try {
      const result = await searchCards(query, 5, 1);
      console.log(`  Found: ${result.totalResults} total (showing ${result.cards.length})`);
      if (result.cards.length > 0) {
        const card = result.cards[0];
        console.log(`  Sample card:`);
        console.log(`    Player: ${card.player}`);
        console.log(`    Year: ${card.year}`);
        console.log(`    Set: ${card.set_name}`);
        console.log(`    Card #: ${card.card_number}`);
        console.log(`    Rookie: ${card.rookie ? 'Yes' : 'No'}`);
        if (card.prices) {
          console.log(`    Prices: RAW=$${card.prices.RAW}, PSA10=$${card.prices.PSA_10}`);
        }
        if (card.last_sale) {
          console.log(`    Last sale: $${card.last_sale.price} (${card.last_sale.grade}) on ${card.last_sale.date}`);
        }
        if (card.population_report) {
          console.log(`    Pop: PSA10=${card.population_report.PSA_10}, PSA9=${card.population_report.PSA_9}`);
        }
      }
    } catch (error) {
      console.log(`  Error: ${error}`);
    }
    await sleep(1000);
    console.log();
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('CardHedger API Scraper');
  console.log('='.repeat(50));

  if (!API_KEY) {
    console.error('\nERROR: CARDHEDGER_API_KEY environment variable required');
    console.error('Usage: CARDHEDGER_API_KEY=your_key npx tsx scripts/scrape-cardhedger.ts');
    process.exit(1);
  }

  console.log(`API Key: ${API_KEY.slice(0, 8)}...`);

  // Test mode
  if (TEST_MODE) {
    await testApi();
    return;
  }

  // Init Supabase
  if (!DRY_RUN) {
    if (!SUPABASE_KEY) {
      console.error('\nERROR: SUPABASE_SERVICE_ROLE_KEY required (or use --dry-run)');
      process.exit(1);
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Connected to Supabase');
  } else {
    console.log('DRY RUN MODE - no database writes');
  }

  // Load or init progress
  let progress: ProgressState;
  if (RESUME) {
    const saved = loadProgress();
    if (saved) {
      progress = saved;
      console.log(`\nResuming from: ${progress.currentCategory}`);
      console.log(`  Cards so far: ${progress.totalCards}`);
      console.log(`  Queries run: ${progress.queriesRun}`);
    } else {
      console.log('No progress file found, starting fresh');
      progress = {
        currentCategory: '',
        currentYear: 0,
        currentOffset: 0,
        totalCards: 0,
        queriesRun: 0,
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        completedCategories: []
      };
    }
  } else {
    progress = {
      currentCategory: '',
      currentYear: 0,
      currentOffset: 0,
      totalCards: 0,
      queriesRun: 0,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      completedCategories: []
    };
  }

  // Filter categories
  let categoriesToScrape = CATEGORIES;
  if (CATEGORY_FILTER) {
    categoriesToScrape = CATEGORIES.filter(c => c.name === CATEGORY_FILTER);
    if (categoriesToScrape.length === 0) {
      console.error(`Unknown category: ${CATEGORY_FILTER}`);
      console.error(`Available: ${CATEGORIES.map(c => c.name).join(', ')}`);
      process.exit(1);
    }
  } else if (RESUME && progress.completedCategories.length > 0) {
    categoriesToScrape = CATEGORIES.filter(c => !progress.completedCategories.includes(c.name));
  }

  console.log(`\nCategories to scrape: ${categoriesToScrape.map(c => c.name).join(', ')}`);
  console.log(`Rate limit: ${REQUESTS_PER_MINUTE} req/min (${DELAY_MS}ms delay)`);

  const startTime = Date.now();

  // Scrape each category
  for (const category of categoriesToScrape) {
    const found = await scrapeCategory(category, progress);
    progress.totalCards += found;
    saveProgress(progress);
  }

  // Final summary
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log('SCRAPE COMPLETE');
  console.log('='.repeat(50));
  console.log(`Duration: ${duration} minutes`);
  console.log(`Total cards found: ${progress.totalCards}`);
  console.log(`Inserted: ${stats.inserted}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Queries run: ${progress.queriesRun}`);

  // Cleanup progress file on success
  if (!RESUME && fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

main().catch(console.error);
