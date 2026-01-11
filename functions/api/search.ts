interface Env {
  DB: D1Database;
  OXYLABS_USERNAME: string;
  OXYLABS_PASSWORD: string;
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

// Check if cache is fresh (less than 24 hours old)
function isCacheFresh(lastFetched: string): boolean {
  const fetchTime = new Date(lastFetched).getTime();
  const now = Date.now();
  const hoursSince = (now - fetchTime) / (1000 * 60 * 60);
  return hoursSince < 24;
}

// Fetch from 130point via Oxylabs Web Scraper API
async function fetchFrom130Point(
  query: string,
  searchType: string,
  env: Env
): Promise<SaleItem[]> {
  const formParams = new URLSearchParams({
    query: query,
    type: searchType,
    subcat: '',
    tab_id: '1',
    tz: 'America/New_York',
    sort: 'date_desc',
  });

  const endpoint = searchType === 'for_sale'
    ? 'https://back.130point.com/affiliate/'
    : 'https://back.130point.com/sales/';

  // Use Oxylabs Realtime API (works from serverless)
  const auth = btoa(`${env.OXYLABS_USERNAME}:${env.OXYLABS_PASSWORD}`);

  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({
      source: 'universal',
      url: endpoint,
      http_method: 'post',
      content_type: 'application/x-www-form-urlencoded',
      body: formParams.toString(),
      render: 'html',
    }),
  });

  const result = await response.json() as { results?: { content?: string }[] };

  if (result.results && result.results[0]?.content) {
    const html = result.results[0].content;
    const jsonMatch = html.match(/id="itemData">\[([\s\S]*?)\]</);

    if (jsonMatch) {
      return JSON.parse('[' + jsonMatch[1] + ']');
    }
  }

  return [];
}

// Store items in D1
async function storeItems(
  items: SaleItem[],
  query: string,
  searchType: string,
  db: D1Database
): Promise<void> {
  // Update search cache
  await db.prepare(`
    INSERT INTO search_cache (query, search_type, last_fetched, result_count)
    VALUES (?, ?, datetime('now'), ?)
    ON CONFLICT(query, search_type) DO UPDATE SET
      last_fetched = datetime('now'),
      result_count = ?
  `).bind(query.toLowerCase(), searchType, items.length, items.length).run();

  // Insert each item (ignore duplicates)
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
}

// Get items from D1 that match the query
async function getFromCache(
  query: string,
  searchType: string,
  db: D1Database
): Promise<{ items: SaleItem[], fresh: boolean }> {
  // Check if we have a fresh cache for this query
  const cache = await db.prepare(`
    SELECT last_fetched, result_count FROM search_cache
    WHERE query = ? AND search_type = ?
  `).bind(query.toLowerCase(), searchType).first();

  if (!cache) {
    return { items: [], fresh: false };
  }

  const fresh = isCacheFresh(cache.last_fetched as string);

  // Search for matching items using LIKE
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  const likeClause = searchTerms.map(() => `LOWER(title) LIKE ?`).join(' AND ');
  const likeParams = searchTerms.map(t => `%${t}%`);

  const results = await db.prepare(`
    SELECT * FROM sales
    WHERE ${likeClause}
    ORDER BY sale_date DESC
    LIMIT 100
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
    source: 'cache',
  }));

  return { items, fresh };
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

    // Try cache first
    const { items: cachedItems, fresh } = await getFromCache(query, searchType, env.DB);

    if (cachedItems.length > 0 && fresh) {
      // Cache hit with fresh data
      return new Response(JSON.stringify({
        success: true,
        items: cachedItems,
        source: 'cache'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Cache miss or stale - fetch from 130point
    const freshItems = await fetchFrom130Point(query, searchType, env);

    if (freshItems.length > 0) {
      // Store in database (async, don't wait)
      context.waitUntil(storeItems(freshItems, query, searchType, env.DB));

      return new Response(JSON.stringify({
        success: true,
        items: freshItems,
        source: 'live'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // If live fetch failed but we have stale cache, return that
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
      error: 'No results found',
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
