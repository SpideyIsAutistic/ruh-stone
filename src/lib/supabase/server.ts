import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './config';

export async function createClient() {
  const cookieStore = await cookies();
  const key = isSupabaseConfigured()
    ? SUPABASE_ANON_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

  return createServerClient(SUPABASE_URL, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing sessions.
        }
      },
    },
  });
}

/**
 * Returns the currently authenticated user from Supabase Auth cookies, or null if unauthenticated.
 */
export async function getAuthenticatedUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
