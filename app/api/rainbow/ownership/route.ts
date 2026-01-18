import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClerkUserId } from '@/lib/auth-helper';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getClerkUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Sign in required' }, { status: 401 });
    }

    const body = await request.json();
    const { catalog_id, owned } = body;

    if (!catalog_id) {
      return NextResponse.json({ success: false, error: 'catalog_id required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get or create user profile
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

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return NextResponse.json({ success: false, error: 'Failed to create profile' }, { status: 500 });
      }
      profile = newProfile;
    }

    // Get catalog card info
    const { data: catalogCard } = await supabase
      .from('card_catalog')
      .select('id, player_name, card_number, subset_name')
      .eq('id', catalog_id)
      .single();

    if (!catalogCard) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }

    if (owned) {
      // Add to inventory
      const { data: existingItem } = await supabase
        .from('inventory')
        .select('id')
        .eq('user_id', profile.id)
        .eq('catalog_id', catalog_id)
        .single();

      if (existingItem) {
        return NextResponse.json({ success: true, message: 'Already owned' });
      }

      const { error: insertError } = await supabase
        .from('inventory')
        .insert({
          user_id: profile.id,
          catalog_id: catalog_id,
          player_name: catalogCard.player_name,
          card_number: catalogCard.card_number,
          status: 'owned',
          notes: `Rainbow tracker: ${catalogCard.subset_name || 'Base'}`
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({ success: false, error: 'Failed to add to inventory' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Added to inventory' });

    } else {
      // Remove from inventory
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .eq('user_id', profile.id)
        .eq('catalog_id', catalog_id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return NextResponse.json({ success: false, error: 'Failed to remove from inventory' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Removed from inventory' });
    }

  } catch (error) {
    console.error('Ownership toggle error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
