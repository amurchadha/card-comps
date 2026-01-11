interface Env {
  DB: D1Database;
  RELAY_API_KEY: string;
}

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

const RELAY_URL = 'https://relay.steepforce.com';

// Check if cache is fresh (less than 6 hours old)
function isCacheFresh(lastFetched: string): boolean {
  const fetchTime = new Date(lastFetched).getTime();
  const now = Date.now();
  const hoursSince = (now - fetchTime) / (1000 * 60 * 60);
  return hoursSince < 6;
}

// Fetch from relay (Puppeteer + Oxylabs + 130point)
async function fetchFromRelay(query: string, searchType: string, apiKey: string): Promise<{ success: boolean; items?: SaleItem[]; error?: string }> {
  try {
    const response = await fetch(`${RELAY_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
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

// Store items in D1
async function storeItems(items: SaleItem[], query: string, searchType: string, db: D1Database): Promise<void> {
  try {
    // Update search cache
    await db.prepare(`
      INSERT INTO search_cache (query, search_type, last_fetched, result_count)
      VALUES (?, ?, datetime('now'), ?)
      ON CONFLICT(query, search_type) DO UPDATE SET
        last_fetched = datetime('now'),
        result_count = ?
    `).bind(query.toLowerCase(), searchType, items.length, items.length).run();

    // Insert items (ignore duplicates)
    for (const item of items) {
      await db.prepare(`
        INSERT OR IGNORE INTO sales (
          item_id, title, sale_price, sale_price_currency,
          current_price, current_price_currency,
          best_offer_price, best_offer_currency,
          sale_type, bids, image_url, sale_date, shipping_cost
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        parseFloat(item.shippingServiceCost) || 0
      ).run();
    }
  } catch (error) {
    console.error('Store error:', error);
  }
}

// Get items from D1 cache
async function getFromCache(query: string, searchType: string, db: D1Database): Promise<{ items: SaleItem[]; fresh: boolean }> {
  try {
    // Check cache freshness
    const cache = await db.prepare(`
      SELECT last_fetched FROM search_cache
      WHERE query = ? AND search_type = ?
    `).bind(query.toLowerCase(), searchType).first();

    const fresh = cache ? isCacheFresh(cache.last_fetched as string) : false;

    // Search for matching items
    const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    if (searchTerms.length === 0) {
      return { items: [], fresh: false };
    }

    const likeClause = searchTerms.map(() => `LOWER(title) LIKE ?`).join(' AND ');
    const likeParams = searchTerms.map(t => `%${t}%`);

    const results = await db.prepare(`
      SELECT * FROM sales
      WHERE ${likeClause}
      ORDER BY sale_date DESC
      LIMIT 200
    `).bind(...likeParams).all();

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

    return { items, fresh };
  } catch (error) {
    console.error('Cache error:', error);
    return { items: [], fresh: false };
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const query = params.get('query') || '';
    const searchType = params.get('type') || 'sold_items';

    if (!query || query.split(/\s+/).length < 2) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Search must contain at least 2 words'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check cache first
    const { items: cachedItems, fresh } = await getFromCache(query, searchType, env.DB);

    if (cachedItems.length > 0 && fresh) {
      return new Response(JSON.stringify({
        success: true,
        items: cachedItems,
        source: 'cache'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Fetch fresh data from relay
    const relayResult = await fetchFromRelay(query, searchType, env.RELAY_API_KEY || 'cardcomps_relay_2026');

    if (relayResult.success && relayResult.items && relayResult.items.length > 0) {
      // Store in cache (don't await)
      context.waitUntil(storeItems(relayResult.items, query, searchType, env.DB));

      return new Response(JSON.stringify({
        success: true,
        items: relayResult.items,
        source: 'live'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // If relay failed but we have stale cache, use it
    if (cachedItems.length > 0) {
      return new Response(JSON.stringify({
        success: true,
        items: cachedItems,
        source: 'stale-cache'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: relayResult.error || 'No results found',
      items: []
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Search failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
