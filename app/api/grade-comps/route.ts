import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface CompData {
  avg: number;
  count: number;
  min: number;
  max: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 3 characters'
      }, { status: 400 });
    }

    const supabase = getSupabase();

    // Search for matching cards in catalog first
    const { data: catalogCards, error: catalogError } = await supabase
      .from('card_catalog')
      .select('id, player_name, card_number, subset_name')
      .or(`player_name.ilike.%${query}%,card_number.ilike.%${query}%`)
      .limit(100);

    if (catalogError) {
      console.error('Catalog search error:', catalogError);
      return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
    }

    if (!catalogCards || catalogCards.length === 0) {
      return NextResponse.json({
        success: true,
        comps: {},
        message: 'No matching cards found'
      });
    }

    const catalogIds = catalogCards.map(c => c.id);

    // Get pricing data for these cards
    const { data: pricingData, error: pricingError } = await supabase
      .from('pricing_data')
      .select('catalog_id, sale_price, grade, grading_company, sale_date')
      .in('catalog_id', catalogIds)
      .gte('sale_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Last 180 days

    if (pricingError) {
      console.error('Pricing query error:', pricingError);
      return NextResponse.json({ success: false, error: 'Pricing lookup failed' }, { status: 500 });
    }

    // Group by grade/company combination
    const comps: Record<string, CompData> = {};

    if (pricingData && pricingData.length > 0) {
      const groups: Record<string, number[]> = {};

      for (const sale of pricingData) {
        let key: string;

        if (!sale.grade || sale.grade.toLowerCase() === 'raw' || sale.grade === '-') {
          key = 'raw';
        } else {
          const company = (sale.grading_company || 'psa').toLowerCase();
          const grade = sale.grade.replace(/\s+/g, '');
          key = `${company}_${grade}`;
        }

        if (!groups[key]) groups[key] = [];
        groups[key].push(sale.sale_price);
      }

      // Calculate stats for each group
      for (const [key, prices] of Object.entries(groups)) {
        if (prices.length > 0) {
          const sum = prices.reduce((a, b) => a + b, 0);
          comps[key] = {
            avg: Math.round(sum / prices.length),
            count: prices.length,
            min: Math.min(...prices),
            max: Math.max(...prices)
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      comps,
      matchedCards: catalogCards.length,
      totalSales: pricingData?.length || 0
    });
  } catch (error) {
    console.error('Grade comps API error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
