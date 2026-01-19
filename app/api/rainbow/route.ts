import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClerkUserId } from '@/lib/auth-helper';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ParallelData {
  id: string;
  card_number: string;
  subset_name: string;
  is_autograph: boolean;
  owned: boolean;
  print_run?: number;
  inventory_id?: string;
  purchase_price?: number;
  grade?: string;
  grading_company?: string;
  last_sale_price?: number;
  last_sale_date?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerName = searchParams.get('player');
    const setId = searchParams.get('set_id');

    if (!playerName || !setId) {
      return NextResponse.json({
        success: false,
        error: 'player and set_id are required'
      }, { status: 400 });
    }

    const supabase = getSupabase();
    const userId = await getClerkUserId();

    // Get user profile if authenticated
    let profileId: string | null = null;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', userId)
        .single();
      profileId = profile?.id || null;
    }

    // Get ALL cards for this player in this set (base + auto)
    const { data: catalogCards, error: catalogError } = await supabase
      .from('card_catalog')
      .select(`
        id,
        card_number,
        player_name,
        subset_name,
        is_autograph,
        parallel_name,
        print_run,
        card_sets (
          id,
          name,
          year,
          sport
        )
      `)
      .eq('set_id', setId)
      .ilike('player_name', playerName);

    if (catalogError) {
      console.error('Catalog query error:', catalogError);
      return NextResponse.json({ success: false, error: 'Failed to fetch catalog' }, { status: 500 });
    }

    if (!catalogCards || catalogCards.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No cards found for this player in this set'
      }, { status: 404 });
    }

    // Get user's inventory for these cards if authenticated
    const ownedMap = new Map<string, { inventory_id: string; purchase_price?: number; grade?: string; grading_company?: string }>();

    if (profileId) {
      const catalogIds = catalogCards.map(c => c.id);
      const { data: inventory } = await supabase
        .from('inventory')
        .select('id, catalog_id, purchase_price, grade, grading_company')
        .eq('user_id', profileId)
        .in('catalog_id', catalogIds);

      if (inventory) {
        for (const item of inventory) {
          if (item.catalog_id) {
            ownedMap.set(item.catalog_id, {
              inventory_id: item.id,
              purchase_price: item.purchase_price,
              grade: item.grade,
              grading_company: item.grading_company
            });
          }
        }
      }
    }

    // Get pricing data for these cards
    const catalogIds = catalogCards.map(c => c.id);
    const { data: pricingData } = await supabase
      .from('pricing_data')
      .select('catalog_id, sale_price, sale_date')
      .in('catalog_id', catalogIds)
      .order('sale_date', { ascending: false });

    // Get latest price per catalog_id
    const pricingMap = new Map<string, { last_sale_price: number; last_sale_date: string }>();
    if (pricingData) {
      for (const price of pricingData) {
        if (!price.catalog_id || pricingMap.has(price.catalog_id)) continue;
        pricingMap.set(price.catalog_id, {
          last_sale_price: price.sale_price,
          last_sale_date: price.sale_date
        });
      }
    }

    // Build parallel data - separate base and auto
    const baseParallels: ParallelData[] = [];
    const autoParallels: ParallelData[] = [];

    // Sort by print_run ascending (rarest first)
    const sortByRarity = (a: ParallelData, b: ParallelData) => {
      const aRun = a.print_run ?? 9999;
      const bRun = b.print_run ?? 9999;
      return aRun - bRun;
    };

    for (const card of catalogCards) {
      const owned = ownedMap.get(card.id);
      const pricing = pricingMap.get(card.id);

      const parallel: ParallelData = {
        id: card.id,
        card_number: card.card_number,
        subset_name: card.subset_name || card.parallel_name || 'Base',
        is_autograph: card.is_autograph || false,
        owned: !!owned,
        print_run: card.print_run,
        inventory_id: owned?.inventory_id,
        purchase_price: owned?.purchase_price,
        grade: owned?.grade,
        grading_company: owned?.grading_company,
        last_sale_price: pricing?.last_sale_price,
        last_sale_date: pricing?.last_sale_date
      };

      if (card.is_autograph) {
        autoParallels.push(parallel);
      } else {
        baseParallels.push(parallel);
      }
    }

    // Sort parallels by rarity (lowest print run first)
    baseParallels.sort(sortByRarity);
    autoParallels.sort(sortByRarity);

    // Get set info from first card
    const firstCard = catalogCards[0] as unknown as { card_sets: { id: string; name: string; year: string; sport: string } | { id: string; name: string; year: string; sport: string }[] };
    const setInfo = Array.isArray(firstCard.card_sets) ? firstCard.card_sets[0] : firstCard.card_sets;

    return NextResponse.json({
      success: true,
      rainbow: {
        player_name: catalogCards[0].player_name,
        set: setInfo,
        base_parallels: baseParallels,
        auto_parallels: autoParallels,
        completion: {
          base: {
            owned: baseParallels.filter(p => p.owned).length,
            total: baseParallels.length
          },
          auto: {
            owned: autoParallels.filter(p => p.owned).length,
            total: autoParallels.length
          }
        }
      }
    });

  } catch (error) {
    console.error('Rainbow API error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
