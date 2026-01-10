interface Env {}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const searchType = params.get('type') || 'sold_items';

    // Use different endpoint for active listings vs sold
    const endpoint = searchType === 'for_sale'
      ? 'https://back.130point.com/affiliate/'
      : 'https://back.130point.com/sales/';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://130point.com',
        'Referer': 'https://130point.com/sales/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: body,
    });

    const html = await response.text();

    // Extract JSON data from the HTML response
    const jsonMatch = html.match(/id="itemData">\[([\s\S]*?)\]</);

    if (jsonMatch) {
      try {
        const items = JSON.parse('[' + jsonMatch[1] + ']');
        return new Response(JSON.stringify({ success: true, items, type: searchType }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'JSON parse error', raw: jsonMatch[0].substring(0, 500) }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Check for error messages in the response
    if (html.includes('Single word searches are not allowed')) {
      return new Response(JSON.stringify({ success: false, error: 'Search query must contain at least 2 words' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (html.includes('too many requests') || html.includes('429')) {
      return new Response(JSON.stringify({ success: false, error: 'Rate limited. Please wait a moment and try again.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'No results found', items: [] }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Search failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
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
