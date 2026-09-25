import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { Locale } from '@/lib/i18n/config';
import { buildNavTree, type NavNode, type NavRow } from '@/lib/navTree';

const FIRST_PARTY_API_KEY = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;

export const NAV_CACHE_TAG = 'website-nav';

// Same server-to-server RPC setup as lib/publicBlogs.ts: no session, tenant
// resolved from the first-party publishable key. Errors are thrown so
// unstable_cache never caches a failed lookup; saveNavItem and friends
// (admin/navigation/actions.ts) bust the tag on every change, the TTL is
// only a safety net.
const fetchNav = unstable_cache(
  async (locale: string | null): Promise<NavRow[]> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      FIRST_PARTY_API_KEY ? { global: { headers: { 'x-api-key': FIRST_PARTY_API_KEY } } } : undefined
    );
    const { data: envelope, error } = await supabase.rpc('fn_get_website_nav', locale ? { p_locale: locale } : {});
    if (error) throw error;
    const result = envelope as { is_success: boolean; message: string; data: NavRow[] };
    if (!result?.is_success) throw new Error(result?.message ?? 'fn_get_website_nav failed');
    return result.data ?? [];
  },
  ['website-nav'],
  { tags: [NAV_CACHE_TAG], revalidate: 3600 }
);

export interface PublishedNav {
  tree: NavNode[];
  byPath: Map<string, NavNode>;
}

// The whole published nav tree for one locale, or null when it couldn't be
// loaded — callers fall back (the header to its built-in menu, CMS pages to
// a 404) rather than failing the render. cache() shares one lookup between
// the layout, generateMetadata and the page within a request.
export const getPublishedNav = cache(async (locale: Locale): Promise<PublishedNav | null> => {
  try {
    const rows = await fetchNav(locale === 'en' ? null : locale);
    const tree = buildNavTree(rows);
    const byPath = new Map<string, NavNode>();
    const index = (nodes: NavNode[]) => {
      for (const node of nodes) {
        byPath.set(node.path, node);
        index(node.children);
      }
    };
    index(tree);
    return { tree, byPath };
  } catch (error) {
    console.error('[publicNav] fn_get_website_nav failed:', error);
    return null;
  }
});
