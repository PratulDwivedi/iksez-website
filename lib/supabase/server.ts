import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// For Server Components, Server Actions, and Route Handlers under /admin.
// Uses the publishable key + the caller's own session cookies — never the
// secret key — so auth.uid()/fn_is_admin() resolve to the real logged-in
// admin, not an all-access service role.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
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
            // Called from a Server Component — safe to ignore since the
            // middleware below refreshes the session on every request.
          }
        },
      },
    }
  );
}
