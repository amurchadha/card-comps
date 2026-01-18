import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const supabase = getSupabase();

    // Search for distinct player + set + card_number combinations
    const { data, error } = await supabase
      .from('card_catalog')
      .select(`
        player_name,
        card_number,
        set_id,
        card_sets (
          id,
          name,
          year
        )
      `)
      .ilike('player_name', `%${query}%`)
      .limit(100);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ results: [] });
    }

    // Deduplicate by player + set + card_number
    const seen = new Set<string>();
    const results: Array<{
      player_name: string;
      set_name: string;
      set_id: string;
      card_number: string;
    }> = [];

    for (const card of data || []) {
      const cardSets = card.card_sets as unknown as { id: string; name: string; year: string } | { id: string; name: string; year: string }[] | null;
      const setData = Array.isArray(cardSets) ? cardSets[0] : cardSets;
      if (!setData) continue;

      const key = `${card.player_name}-${setData.id}-${card.card_number}`;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        player_name: card.player_name,
        set_name: `${setData.year} ${setData.name}`,
        set_id: setData.id,
        card_number: card.card_number
      });
    }

    // Sort by player name
    results.sort((a, b) => a.player_name.localeCompare(b.player_name));

    return NextResponse.json({ results: results.slice(0, 20) });

  } catch (error) {
    console.error('Rainbow search error:', error);
    return NextResponse.json({ results: [] });
  }
}
