'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const VISITOR_KEY = 'iksez_visitor_id';
const SESSION_KEY = 'iksez_session_id';

function getOrCreateId(storage: Storage, key: string): string {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    storage.setItem(key, id);
    return id;
  } catch {
    // Storage unavailable (private browsing, disabled storage, etc.) —
    // fall back to a per-call id rather than throwing; the hit still
    // records, it just won't dedupe against this visitor's other hits.
    return crypto.randomUUID();
  }
}

// Posts a pageview to this site's own /api/analytics on every route change
// (see app/api/analytics/route.ts, lib/publicAnalytics.ts,
// supabase/functions/fn_track_website_event.sql — same backend
// portage_now_web_site's PageviewTracker.tsx uses). Uses
// NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY (IFFCO Kisan SEZ's own tenant key from
// /admin/settings), not the Supabase key — that key authenticates to
// Supabase's API surface in general, this one scopes a request to this
// tenant's data specifically (see fn_get_request_context).
export function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;
    if (!apiKey || typeof window === 'undefined') return;

    // Don't let local dev browsing pollute production analytics — every
    // `npm run dev` pageview would otherwise show up in the real tenant's
    // dashboard/unique-visitor counts.
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    const visitorId = getOrCreateId(window.localStorage, VISITOR_KEY);
    const sessionId = getOrCreateId(window.sessionStorage, SESSION_KEY);

    // keepalive lets the request survive a same-tick navigation/unload;
    // errors are swallowed on purpose — a tracking failure must never
    // surface to the visitor or block/slow the page.
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        path,
        url: window.location.href,
        referrer: document.referrer || undefined,
        title: document.title,
        visitor_id: visitorId,
        session_id: sessionId,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
