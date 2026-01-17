import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy getters for environment variables to avoid build-time errors
const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const getServiceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for browser-side usage (respects RLS)
// Lazy initialization to avoid build-time errors
let _supabase: SupabaseClient | null = null;
export const getSupabase = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!_supabase && url && key) {
    _supabase = createClient(url, key);
  }
  return _supabase;
};

// Create a client with the user's JWT for authenticated requests
export function createSupabaseClient(supabaseAccessToken?: string) {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error('Supabase configuration missing');
  }
  return createClient(url, key, {
    global: {
      headers: supabaseAccessToken
        ? { Authorization: `Bearer ${supabaseAccessToken}` }
        : {},
    },
  });
}

// Server-side client with service role (bypasses RLS - use carefully!)
export function createServerSupabase() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase configuration missing');
  }
  return createClient(url, serviceRoleKey);
}
