import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/account';

  if (code && isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error('Auth code exchange error:', err);
      return NextResponse.redirect(new URL(`/login?error=auth_exchange_failed`, requestUrl.origin));
    }
  }

  // Ensure redirect URL is relative to prevent open-redirect vulnerabilities
  const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/account';
  return NextResponse.redirect(new URL(safeRedirect, requestUrl.origin));
}
