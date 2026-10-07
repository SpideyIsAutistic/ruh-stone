export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wfgrmntirpacqfogqpda.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_ANON_KEY.includes('placeholder')
  );
}
