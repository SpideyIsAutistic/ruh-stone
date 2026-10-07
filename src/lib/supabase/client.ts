import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './config';

export { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured };

export function createClient() {
  // If not configured, provide a safe fallback so the app builds and runs without crashing
  const key = isSupabaseConfigured() ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';
  return createBrowserClient(SUPABASE_URL, key);
}
