import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { LOCALE_COOKIE, defaultLocale, hasLocale } from './lib/i18n/config';

// Two jobs, split by path:
//
// - /admin: refreshes the Supabase session cookie and redirects
//   unauthenticated requests to /admin/login (lib/supabase/middleware.ts).
//
// - Everything else is the marketing site, whose routes all live under
//   app/(marketing)/[lang]/. English keeps its existing unprefixed URLs, so
//   /about-us/ is rewritten (not redirected — the URL bar doesn't change)
//   to /en/about-us/. Other locales are already prefixed (/te/about-us/)
//   and pass straight through. See lib/i18n/config.ts.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return updateSession(request);
  }

  const first = pathname.split('/')[1];

  // /en/about-us/ would be a duplicate of /about-us/ — send it to the one
  // canonical URL instead of serving the same page twice.
  if (first === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (hasLocale(first)) return NextResponse.next();

  // A visitor who picked a language with the switcher gets it back when
  // they land on the homepage. Only "/" — inner pages always open in the
  // language of their URL, so shared links and crawlers see what was linked.
  if (pathname === '/') {
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
    if (hasLocale(preferred) && preferred !== defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}/`;
      return NextResponse.redirect(url, 307);
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except API routes, Next.js internals (_next/*, __nextjs_*)
  // and files with an extension (/images/logo.png, /sitemap.xml, ...).
  // /admin is included on purpose — it's handled by the first branch above.
  matcher: ['/((?!api/|api$|_next/|__next|.*\\..*).*)'],
};
