import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/profile - Get or create user profile
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const supabase = createServerSupabase();

  // Try to get existing profile
  const { data: profile, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (profile) {
    return NextResponse.json({ profile });
  }

  // Create new profile if doesn't exist
  const email = user.emailAddresses?.[0]?.emailAddress;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || email?.split('@')[0];

  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert({
      clerk_id: userId,
      email: email,
      display_name: displayName,
      avatar_url: user.imageUrl,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating profile:', insertError);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }

  return NextResponse.json({ profile: newProfile });
}
