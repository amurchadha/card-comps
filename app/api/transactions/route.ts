import { auth } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET - List user's transactions
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabase();

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ transactions: [] });
    }

    // Get transactions with inventory details
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        inventory:inventory_id (
          player_name,
          card_number,
          grade,
          grading_company
        )
      `)
      .eq('user_id', profile.id)
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ transactions: transactions || [] });
  } catch (error) {
    console.error('Transactions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST - Add new transaction (sale)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Calculate fees and profit
    const grossAmount = parseFloat(body.gross_amount) || 0;
    const platformFeePct = parseFloat(body.platform_fee_pct) || 0;
    const platformFees = grossAmount * (platformFeePct / 100);
    const shippingCost = parseFloat(body.shipping_cost) || 0;
    const netAmount = grossAmount - platformFees - shippingCost;
    const costBasis = parseFloat(body.cost_basis) || 0;
    const profit = netAmount - costBasis;
    const roiPct = costBasis > 0 ? (profit / costBasis) * 100 : 0;

    // Insert transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: profile.id,
        inventory_id: body.inventory_id || null,
        type: body.type || 'sale',
        platform: body.platform,
        gross_amount: grossAmount,
        platform_fee_pct: platformFeePct,
        platform_fees: platformFees,
        shipping_cost: shippingCost,
        net_amount: netAmount,
        cost_basis: costBasis,
        profit: profit,
        roi_pct: roiPct,
        transaction_date: body.transaction_date || new Date().toISOString().split('T')[0],
        buyer_username: body.buyer_username,
        tracking_number: body.tracking_number,
        notes: body.notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Update inventory item status if linked
    if (body.inventory_id) {
      await supabase
        .from('inventory')
        .update({ status: 'sold', updated_at: new Date().toISOString() })
        .eq('id', body.inventory_id)
        .eq('user_id', profile.id);
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Transaction POST error:', error);
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 });
  }
}

// DELETE - Remove transaction
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
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

    // Get transaction to restore inventory status
    const { data: transaction } = await supabase
      .from('transactions')
      .select('inventory_id')
      .eq('id', transactionId)
      .eq('user_id', profile.id)
      .single();

    // Delete transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', profile.id);

    if (error) throw error;

    // Restore inventory item status if linked
    if (transaction?.inventory_id) {
      await supabase
        .from('inventory')
        .update({ status: 'owned', updated_at: new Date().toISOString() })
        .eq('id', transaction.inventory_id)
        .eq('user_id', profile.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transaction DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
