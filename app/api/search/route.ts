import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const RELAY_URL = 'https://relay.steepforce.com';

interface SaleItem {
  itemId: string;
  title: string;
  currentPrice: string;
  currentPriceCurrency: string;
  salePrice: string;
  salePriceCurrency: string;
  BestOfferPrice: string;
  BestOfferPriceCurrency: string;
  bids: string;
  saleType: string;
  galleryURL: string;
  endTime: string;
  shippingServiceCost: string;
}

interface CatalogMatch {
  catalog_id: string;
  set_id: string;
}

// Extract potential player name from eBay title
function extractPlayerName(title: string): string | null {
  const cleaned = title
    .replace(/psa|bgs|sgc|cgc|\d+\/\d+|#\d+|\d{4}(-\d{2})?/gi, '')
    .replace(/prizm|select|mosaic|optic|chrome|topps|panini|donruss|bowman/gi, '')
    .replace(/auto|autograph|rc|rookie|refractor|parallel|base|insert/gi, '')
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const nameMatch = cleaned.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/);
  return nameMatch ? nameMatch[1] : null;
}

// Query Supabase for catalog match
async function findCatalogMatch(title: string): Promise<CatalogMatch | null> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const playerName = extractPlayerName(title);
  if (!playerName) return null;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('card_catalog')
      .select('id,set_id')
      .ilike('player_name', `%${playerName}%`)
      .limit(1);

    if (data && data.length > 0) {
      return { catalog_id: data[0].id, set_id: data[0].set_id };
    }
  } catch {
    // Silently fail - matching is best-effort
  }

  return null;
}

// Common abbreviation mappings
const TERM_ALIASES: Record<string, string[]> = {
  'autographs': ['auto', 'autograph', 'autographed', 'autos'],
  'autograph': ['auto', 'autographs', 'autographed', 'autos'],
  'auto': ['autograph', 'autographs', 'autographed'],
  'refractor': ['refractors', 'ref'],
  'refractors': ['refractor', 'ref'],
  'rookie': ['rc', 'rookies'],
  'rc': ['rookie', 'rookies'],
  'parallel': ['parallels', '/'],
  'numbered': ['#', '/'],
  'prizm': ['prism'],
  'psa': ['bgs', 'sgc', 'cgc'],
};

// Filter items to ensure title contains search terms
function filterRelevantItems(items: SaleItem[], query: string): SaleItem[] {
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  return items.filter(item => {
    const title = item.title.toLowerCase();
    return searchTerms.every(term => {
      if (title.includes(term)) return true;
      const aliases = TERM_ALIASES[term];
      if (aliases) {
        return aliases.some(alias => title.includes(alias));
      }
      return false;
    });
  });
}

// Fetch from relay
async function fetchFromRelay(query: string, searchType: string): Promise<{ success: boolean; items?: SaleItem[]; error?: string }> {
  try {
    const response = await fetch(`${RELAY_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.RELAY_API_KEY || 'cardcomps_relay_2026',
      },
      body: JSON.stringify({ query, type: searchType }),
    });

    if (!response.ok) {
      return { success: false, error: `Relay error: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error('Relay fetch error:', error);
    return { success: false, error: 'Relay unavailable' };
  }
}

// Check if cache is fresh (less than 6 hours old)
function isCacheFresh(lastFetched: string): boolean {
  const fetchTime = new Date(lastFetched).getTime();
  const now = Date.now();
  const hoursSince = (now - fetchTime) / (1000 * 60 * 60);
  return hoursSince < 6;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const query = params.get('query') || '';
    const searchType = params.get('type') || 'sold_items';

    if (!query || query.split(/\s+/).length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search must contain at least 2 words'
      });
    }

    // Try to get D1 database from Cloudflare context
    let db: D1Database | null = null;
    try {
      const { env } = await getCloudflareContext();
      db = env.DB as D1Database;
    } catch {
      console.log('D1 not available - running without cache');
    }

    // Check cache if D1 is available
    if (db) {
      try {
        const cache = await db.prepare(`
          SELECT last_fetched FROM search_cache
          WHERE query = ? AND search_type = ?
        `).bind(query.toLowerCase(), searchType).first();

        const fresh = cache ? isCacheFresh(cache.last_fetched as string) : false;

        if (fresh) {
          const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
          const likeClause = searchTerms.map(() => `LOWER(title) LIKE ?`).join(' AND ');
          const likeParams = searchTerms.map(t => `%${t}%`);

          const results = await db.prepare(`
            SELECT * FROM sales WHERE ${likeClause} ORDER BY sale_date DESC LIMIT 200
          `).bind(...likeParams).all();

          if (results.results.length > 0) {
            const items: SaleItem[] = results.results.map((row: Record<string, unknown>) => ({
              itemId: row.item_id as string,
              title: row.title as string,
              currentPrice: String(row.current_price),
              currentPriceCurrency: row.current_price_currency as string,
              salePrice: String(row.sale_price),
              salePriceCurrency: row.sale_price_currency as string,
              BestOfferPrice: String(row.best_offer_price),
              BestOfferPriceCurrency: row.best_offer_currency as string,
              bids: String(row.bids),
              saleType: row.sale_type as string,
              galleryURL: row.image_url as string,
              endTime: row.sale_date as string,
              shippingServiceCost: String(row.shipping_cost),
            }));

            return NextResponse.json({
              success: true,
              items,
              source: 'cache'
            });
          }
        }
      } catch (e) {
        console.error('Cache check error:', e);
      }
    }

    // Fetch fresh data from relay
    const relayResult = await fetchFromRelay(query, searchType);

    if (relayResult.success && relayResult.items && relayResult.items.length > 0) {
      const filteredItems = filterRelevantItems(relayResult.items, query);

      // Store in cache if D1 is available (don't await)
      if (db) {
        storeItems(filteredItems, query, searchType, db).catch(console.error);
      }

      return NextResponse.json({
        success: true,
        items: filteredItems,
        source: 'live'
      });
    }

    return NextResponse.json({
      success: false,
      error: relayResult.error || 'No results found',
      items: []
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed'
    }, { status: 500 });
  }
}

// Store items in D1 with catalog linking
async function storeItems(items: SaleItem[], query: string, searchType: string, db: D1Database): Promise<void> {
  try {
    await db.prepare(`
      INSERT INTO search_cache (query, search_type, last_fetched, result_count)
      VALUES (?, ?, datetime('now'), ?)
      ON CONFLICT(query, search_type) DO UPDATE SET
        last_fetched = datetime('now'),
        result_count = ?
    `).bind(query.toLowerCase(), searchType, items.length, items.length).run();

    for (const item of items) {
      const match = await findCatalogMatch(item.title);

      await db.prepare(`
        INSERT OR IGNORE INTO sales (
          item_id, title, sale_price, sale_price_currency,
          current_price, current_price_currency,
          best_offer_price, best_offer_currency,
          sale_type, bids, image_url, sale_date, shipping_cost,
          catalog_id, set_id, matched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        item.itemId,
        item.title,
        parseFloat(item.salePrice) || 0,
        item.salePriceCurrency || 'USD',
        parseFloat(item.currentPrice) || 0,
        item.currentPriceCurrency || 'USD',
        parseFloat(item.BestOfferPrice) || 0,
        item.BestOfferPriceCurrency || 'USD',
        item.saleType,
        parseInt(item.bids) || 0,
        item.galleryURL,
        item.endTime,
        parseFloat(item.shippingServiceCost) || 0,
        match?.catalog_id || null,
        match?.set_id || null,
        match ? new Date().toISOString() : null
      ).run();
    }
  } catch (error) {
    console.error('Store error:', error);
  }
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
