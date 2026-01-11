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

    // Search cached data using LIKE matching
    const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

    if (searchTerms.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No valid search terms',
        items: []
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const likeClause = searchTerms.map(() => `LOWER(title) LIKE ?`).join(' AND ');
    const likeParams = searchTerms.map(t => `%${t}%`);

    const results = await env.DB.prepare(`
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
    }));

    return new Response(JSON.stringify({
      success: true,
      items,
      source: 'cache',
      count: items.length
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
