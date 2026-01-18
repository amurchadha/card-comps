import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/catalog?q=wembanyama&year=2023-24&limit=50
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const year = searchParams.get('year');
    const setId = searchParams.get('set_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query && !setId) {
      return NextResponse.json({ error: 'Query or set_id required' }, { status: 400 });
    }

    // Build query
    let dbQuery = supabase
      .from('card_catalog')
      .select(`
        id,
        card_number,
        player_name,
        team,
        subset_name,
        is_rookie,
        is_autograph,
        is_insert,
        parallel_name,
        print_run,
        card_sets (
          id,
          name,
          year,
          manufacturer,
          product_line
        )
      `)
      .order('player_name')
      .range(offset, offset + limit - 1);

    // Filter by search query
    if (query) {
      // Use ILIKE for case-insensitive search
      dbQuery = dbQuery.or(`player_name.ilike.%${query}%,team.ilike.%${query}%`);
    }

    // Filter by set
    if (setId) {
      dbQuery = dbQuery.eq('set_id', setId);
    }

    // Filter by year (via join)
    if (year) {
      dbQuery = dbQuery.eq('card_sets.year', year);
    }

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('Catalog search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({
      cards: data || [],
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Catalog API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/catalog - list sets or years
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'list_sets') {
      const year = body.year;
      const sport = body.sport || 'basketball';

      let query = supabase
        .from('card_sets')
        .select('id, name, year, manufacturer, product_line')
        .eq('sport', sport)
        .order('year', { ascending: false })
        .order('name');

      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;

      if (error) {
        console.error('List sets error:', error);
        return NextResponse.json({ error: 'Failed to list sets' }, { status: 500 });
      }

      return NextResponse.json({ sets: data || [] });
    }

    if (action === 'list_years') {
      const sport = body.sport || 'basketball';

      const { data, error } = await supabase
        .from('card_sets')
        .select('year')
        .eq('sport', sport)
        .order('year', { ascending: false });

      if (error) {
        console.error('List years error:', error);
        return NextResponse.json({ error: 'Failed to list years' }, { status: 500 });
      }

      // Get unique years
      const years = [...new Set(data?.map(d => d.year) || [])];
      return NextResponse.json({ years });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Catalog POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
