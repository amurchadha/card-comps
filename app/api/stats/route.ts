import { createServerSupabase } from '@/lib/supabase';
import { getClerkUserId } from '@/lib/auth-helper';
import { NextResponse } from 'next/server';

// GET - Get user's aggregated stats
export async function GET() {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      // Return empty stats for unauthenticated users
      return NextResponse.json({
        inventory: { count: 0, totalCost: 0 },
        transactions: { count: 0, totalRevenue: 0, totalProfit: 0, avgRoi: 0 },
        goals: { active: 0, achieved: 0, totalTarget: 0, totalFunded: 0 },
        recentActivity: [],
      });
    }

    const supabase = createServerSupabase();

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({
        inventory: { count: 0, totalCost: 0 },
        transactions: { count: 0, totalRevenue: 0, totalProfit: 0, avgRoi: 0 },
        goals: { active: 0, achieved: 0, totalTarget: 0, totalFunded: 0 },
        recentActivity: [],
      });
    }

    // Get inventory stats
    const { data: inventory } = await supabase
      .from('inventory')
      .select('total_cost, status')
      .eq('user_id', profile.id);

    const ownedInventory = (inventory || []).filter(i => i.status === 'owned');
    const inventoryStats = {
      count: ownedInventory.length,
      totalCost: ownedInventory.reduce((sum, i) => sum + (i.total_cost || 0), 0),
    };

    // Get transaction stats
    const { data: transactions } = await supabase
      .from('transactions')
      .select('gross_amount, profit, roi_pct, transaction_date')
      .eq('user_id', profile.id)
      .order('transaction_date', { ascending: false });

    const transactionStats = {
      count: (transactions || []).length,
      totalRevenue: (transactions || []).reduce((sum, t) => sum + (t.gross_amount || 0), 0),
      totalProfit: (transactions || []).reduce((sum, t) => sum + (t.profit || 0), 0),
      avgRoi: transactions && transactions.length > 0
        ? transactions.reduce((sum, t) => sum + (t.roi_pct || 0), 0) / transactions.length
        : 0,
    };

    // Get goal stats
    const { data: goals } = await supabase
      .from('goals')
      .select('status, target_price, current_funding')
      .eq('user_id', profile.id);

    const activeGoals = (goals || []).filter(g => g.status === 'active');
    const achievedGoals = (goals || []).filter(g => g.status === 'achieved');
    const goalStats = {
      active: activeGoals.length,
      achieved: achievedGoals.length,
      totalTarget: activeGoals.reduce((sum, g) => sum + (g.target_price || 0), 0),
      totalFunded: activeGoals.reduce((sum, g) => sum + (g.current_funding || 0), 0),
    };

    // Get recent transactions for activity feed
    const recentActivity = (transactions || []).slice(0, 5).map(t => ({
      type: 'sale',
      amount: t.profit,
      date: t.transaction_date,
    }));

    return NextResponse.json({
      inventory: inventoryStats,
      transactions: transactionStats,
      goals: goalStats,
      recentActivity,
    });
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
