import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser-side usage (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a client with the user's JWT for authenticated requests
export function createSupabaseClient(supabaseAccessToken?: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: supabaseAccessToken
        ? { Authorization: `Bearer ${supabaseAccessToken}` }
        : {},
    },
  });
}

// Server-side client with service role (bypasses RLS - use carefully!)
export function createServerSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}
