interface Env {
  EBAY_CLIENT_ID: string;
  EBAY_CLIENT_SECRET: string;
  EBAY_CAMPAIGN_ID: string;
}

interface EbayItem {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  image?: {
    imageUrl: string;
  };
  itemWebUrl: string;
  condition?: string;
  itemLocation?: {
    country: string;
  };
}

interface EbaySearchResponse {
  itemSummaries?: EbayItem[];
  total?: number;
  errors?: Array<{ message: string }>;
}

// Get OAuth token from eBay
async function getEbayToken(clientId: string, clientSecret: string): Promise<string | null> {
  try {
    const credentials = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });

    if (!response.ok) {
      console.error('eBay token error:', response.status, await response.text());
      return null;
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error('eBay token fetch error:', error);
    return null;
  }
}

// Search eBay for live listings
async function searchEbay(query: string, token: string, limit: number = 4): Promise<EbayItem[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      sort: 'newlyListed',
      filter: 'buyingOptions:{FIXED_PRICE|AUCTION}',
    });

    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId=5339137501',
        },
      }
    );

    if (!response.ok) {
      console.error('eBay search error:', response.status, await response.text());
      return [];
    }

    const data = await response.json() as EbaySearchResponse;
    return data.itemSummaries || [];
  } catch (error) {
    console.error('eBay search fetch error:', error);
    return [];
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const query = params.get('query') || '';

    if (!query || query.split(/\s+/).length < 2) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Search must contain at least 2 words'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Get OAuth token
    const token = await getEbayToken(
      env.EBAY_CLIENT_ID || 'AaronMur-EzComps-PRD-0cd4f0a51-edee0548',
      env.EBAY_CLIENT_SECRET || ''
    );

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'eBay authentication failed',
        debug: { hasClientId: !!env.EBAY_CLIENT_ID, hasClientSecret: !!env.EBAY_CLIENT_SECRET }
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Search for live listings (get more than 4 in case some lack prices)
    const items = await searchEbay(query, token, 12);

    // Transform to our format with affiliate links
    const campaignId = env.EBAY_CAMPAIGN_ID || '5339137501';
    const transformedItems = items
      .filter(item => item.price?.value) // Only items with valid prices
      .slice(0, 4) // Take first 4
      .map(item => ({
        itemId: item.itemId.replace('v1|', '').split('|')[0],
        title: item.title,
        currentPrice: item.price.value,
        currentPriceCurrency: item.price.currency,
        galleryURL: item.image?.imageUrl || '',
        ebayUrl: `${item.itemWebUrl}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=${campaignId}&toolid=10001&mkevt=1`,
        condition: item.condition || 'Not specified',
      }));

    return new Response(JSON.stringify({
      success: true,
      items: transformedItems,
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('eBay live search error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: `Search failed: ${error instanceof Error ? error.message : String(error)}`
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
