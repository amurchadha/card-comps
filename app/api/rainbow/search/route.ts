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

    // Search for cards matching player name
    const { data, error } = await supabase
      .from('card_catalog')
      .select(`
        player_name,
        set_id,
        card_sets (
          id,
          name,
          year
        )
      `)
      .ilike('player_name', `%${query}%`)
      .limit(500);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ results: [] });
    }

    // Deduplicate by player + set, filter garbage
    const seen = new Set<string>();
    const results: Array<{
      player_name: string;
      set_name: string;
      set_id: string;
    }> = [];

    for (const card of data || []) {
      const cardSets = card.card_sets as unknown as { id: string; name: string; year: string } | { id: string; name: string; year: string }[] | null;
      const setData = Array.isArray(cardSets) ? cardSets[0] : cardSets;
      if (!setData) continue;

      // Filter out actual garbage (eBay shop links)
      const setNameLower = setData.name.toLowerCase();
      if (setNameLower.includes('shop for')) continue;
      if (setNameLower.includes('ebay')) continue;

      const key = `${card.player_name}-${setData.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Clean up set name - remove "Checklist", "Cards Checklist", etc.
      let cleanName = setData.name
        .replace(/\s*Cards?\s*Checklist\s*/gi, '')
        .replace(/\s*Checklist\s*/gi, '')
        .trim();

      // Don't duplicate year if it's already in the set name
      const displayName = cleanName.startsWith(setData.year)
        ? cleanName
        : `${setData.year} ${cleanName}`;

      results.push({
        player_name: card.player_name,
        set_name: displayName,
        set_id: setData.id
      });
    }

    // Sort by year (newest first), then by set name
    results.sort((a, b) => {
      const yearA = a.set_name.substring(0, 7);
      const yearB = b.set_name.substring(0, 7);
      if (yearA !== yearB) return yearB.localeCompare(yearA);
      return a.set_name.localeCompare(b.set_name);
    });

    return NextResponse.json({ results: results.slice(0, 30) });

  } catch (error) {
    console.error('Rainbow search error:', error);
    return NextResponse.json({ results: [] });
  }
}
