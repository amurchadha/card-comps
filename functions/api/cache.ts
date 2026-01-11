interface Env {
  DB: D1Database;
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { query, type, items } = await request.json() as {
      query: string;
      type: string;
      items: SaleItem[];
    };

    if (!query || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Update search cache
    await env.DB.prepare(`
      INSERT INTO search_cache (query, search_type, last_fetched, result_count)
      VALUES (?, ?, datetime('now'), ?)
      ON CONFLICT(query, search_type) DO UPDATE SET
        last_fetched = datetime('now'),
        result_count = ?
    `).bind(query.toLowerCase(), type, items.length, items.length).run();

    // Insert items (ignore duplicates)
    for (const item of items) {
      await env.DB.prepare(`
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

    return new Response(JSON.stringify({ success: true, cached: items.length }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Cache error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Cache failed' }), {
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
