import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

// Refreshes the Supabase session cookie on every /admin request and
// redirects unauthenticated requests to /admin/login. Scoped to /admin only
// — the rest of this site is static marketing content with no auth.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/admin/:path*'],
};
