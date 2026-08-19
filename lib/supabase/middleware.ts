import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refreshes the Supabase session cookie on every /admin request. Scoped to
// /admin only (see proxy.ts's matcher) — the rest of this site is static
// marketing content with no auth, no reason to run this elsewhere.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not add logic between createServerClient and getUser() — Supabase's
  // own guidance: it's easy to introduce subtle bugs that randomly log
  // users out if anything runs in between.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // next.config.ts sets trailingSlash: true, so '/admin/login' 308-redirects
  // to '/admin/login/' before this ever runs — match both, and redirect to
  // the trailing-slash form, or this loops forever against that redirect.
  const isLoginPage =
    request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/login/';

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login/';
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
