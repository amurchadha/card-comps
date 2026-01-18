import { createServerSupabase } from '@/lib/supabase';
import { getClerkUserId } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';

// GET - List user's inventory
export async function GET() {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    const supabase = createServerSupabase();

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ items: [] });
    }

    // Get inventory
    const { data: items, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// POST - Add new inventory item
export async function POST(request: NextRequest) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createServerSupabase();

    // Get or create profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({ clerk_id: userId })
        .select('id')
        .single();

      if (profileError) throw profileError;
      profile = newProfile;
    }

    // Insert inventory item
    const { data: item, error } = await supabase
      .from('inventory')
      .insert({
        user_id: profile.id,
        player_name: body.player_name,
        card_number: body.card_number,
        purchase_price: body.purchase_price || 0,
        purchase_tax: body.purchase_tax || 0,
        shipping_paid: body.shipping_paid || 0,
        purchase_date: body.purchase_date,
        purchase_source: body.purchase_source,
        purchase_platform: body.purchase_platform,
        grade: body.grade,
        grading_company: body.grading_company,
        cert_number: body.cert_number,
        notes: body.notes,
        status: 'owned',
        // New ROI fields
        card_status: body.card_status || 'raw',
        raw_purchase_price: body.raw_purchase_price || body.purchase_price || 0,
        acquisition_shipping: body.acquisition_shipping || body.shipping_paid || 0,
        acquisition_tax: body.acquisition_tax || body.purchase_tax || 0,
        grading_company_used: body.grading_company_used,
        grading_service_level: body.grading_service_level,
        grading_fee: body.grading_fee || 0,
        grading_insurance: body.grading_insurance || 0,
        inbound_shipping: body.inbound_shipping || 0,
        outbound_shipping: body.outbound_shipping || 0,
        supply_costs: body.supply_costs || 0,
        grading_submitted_date: body.grading_submitted_date,
        grading_received_date: body.grading_received_date,
        expected_grade: body.expected_grade,
        actual_grade: body.actual_grade,
        listed_price: body.listed_price,
        listed_date: body.listed_date,
        sale_price: body.sale_price,
        sale_date: body.sale_date,
        sale_platform: body.sale_platform,
        platform_fee_percent: body.platform_fee_percent,
        platform_fees: body.platform_fees,
        sale_shipping_cost: body.sale_shipping_cost || 0,
        buyer_paid_shipping: body.buyer_paid_shipping || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

// DELETE - Remove inventory item
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Delete item (only if belongs to user)
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', itemId)
      .eq('user_id', profile.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inventory DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

// PATCH - Update inventory item
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Update item (only if belongs to user)
    const { data: item, error } = await supabase
      .from('inventory')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', profile.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Inventory PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
