import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- missing svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the payload
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred during verification', {
      status: 400,
    });
  }

  // Handle the event
  const supabase = createServerSupabase();

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const displayName = [first_name, last_name].filter(Boolean).join(' ') || email?.split('@')[0];

    const { error } = await supabase
      .from('profiles')
      .upsert({
        clerk_id: id,
        email: email,
        display_name: displayName,
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'clerk_id',
      });

    if (error) {
      console.error('Error syncing user to Supabase:', error);
      return new Response('Error syncing user', { status: 500 });
    }
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data;

    // Delete user profile (cascade will handle related data)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('clerk_id', id);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
    }
  }

  return new Response('Webhook processed', { status: 200 });
}
