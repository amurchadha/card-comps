import { createServerSupabase } from '@/lib/supabase';
import { getClerkUserId } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';

// GET - List user's goals
export async function GET() {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ goals: [] });
    }

    const supabase = createServerSupabase();

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ goals: [] });
    }

    // Get goals
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ goals: goals || [] });
  } catch (error) {
    console.error('Goals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST - Add new goal
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

    // Insert goal
    const { data: goal, error } = await supabase
      .from('goals')
      .insert({
        user_id: profile.id,
        player_name: body.player_name,
        card_description: body.card_description,
        set_name: body.set_name,
        parallel_name: body.parallel_name,
        target_price: parseFloat(body.target_price) || 0,
        current_funding: parseFloat(body.current_funding) || 0,
        target_image_url: body.target_image_url,
        ebay_search_url: body.ebay_search_url,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Goal POST error:', error);
    return NextResponse.json({ error: 'Failed to add goal' }, { status: 500 });
  }
}

// PATCH - Update goal
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
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

    // Check if achieved
    if (updates.current_funding !== undefined && updates.target_price !== undefined) {
      if (updates.current_funding >= updates.target_price && updates.status !== 'achieved') {
        updates.status = 'achieved';
        updates.achieved_at = new Date().toISOString();
      }
    }

    // Update goal
    const { data: goal, error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', profile.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Goal PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

// DELETE - Remove goal
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('id');

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
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

    // Delete goal
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', profile.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Goal DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
