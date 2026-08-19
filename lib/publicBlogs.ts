import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { BlogBlock } from '@/lib/blogBody';
import { resolveCoverUrl } from '@/lib/blogCover';
import type { FaqItem } from '@/lib/blogFaq';

// Exactly what fn_get_website_blogs returns per row (see
// supabase/functions/fn_get_website_blogs.sql) — passed through untouched
// to API consumers, not reshaped/renamed into a bespoke frontend shape, with
// one deliberate exception: cover_url is resolved (see resolveCoverUrl) from
// the DB's stored bare filename/path into a fully usable URL before it ever
// reaches a caller, so every consumer (this app's own pages, /api/blogs,
// /api/blogs/[slug], any third-party tenant's integration) gets a real URL
// without needing to know about the blog-covers bucket convention.
export interface BlogRow {
  id: number;
  name: string;
  title: string;
  excerpt: string;
  category_id: number;
  category: string;
  cover_url: string;
  cover_alt: string;
  tags: string[];
  keywords: string[];
  author_name: string;
  author_role: string | null;
  read_minutes: number;
  body: BlogBlock[];
  published: boolean;
  is_active: boolean;
  // Open-ended per-post metadata bucket (website_blogs.data). Only faqs is
  // used today (optional — see src/lib/blogFaq.ts), but the shape stays a
  // loose record rather than `{ faqs?: FaqItem[] }` so a future field here
  // doesn't require a type change everywhere this interface is imported.
  data: { faqs?: FaqItem[] } & Record<string, unknown>;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface BlogListPaging {
  total_records: number;
  page_size: number;
  page_index: number;
}

// Mirrors fn_response_success/fn_response_error's envelope exactly (see
// supabase/functions/fn_response_success.sql) — every RPC-backed public API
// this app exposes (blogs today, leads/contact later) returns this same
// shape, generically: `data` is a list, `paging` describes it, `is_success`/
// `message`/`status_code` describe the outcome. Don't rename `data` to
// something endpoint-specific like `posts`, and don't reshape the rows
// inside it — that's the whole point of a generic passthrough.
export interface BlogListResult {
  is_success: boolean;
  message: string;
  status_code: number;
  data: BlogRow[];
  paging: BlogListPaging;
}

export interface BlogListParams {
  search?: string;
  category?: string;
  // Multi-select tag filter — OR/overlap semantics (see p_tags in
  // fn_get_website_blogs.sql): a post matches if it has ANY of these tags.
  tags?: string[];
  page?: number;
  pageSize?: number;
  // Forwarded from a third-party caller's own x-api-key (see
  // src/app/api/blogs/route.ts) so fn_get_website_blogs resolves *their*
  // tenant instead of defaulting to IFFCO Kisan SEZ's.
  apiKey?: string;
}

// No cookies/session here (this is server-to-server RPC, not a browser
// session) — tenant resolution is entirely driven by apiKey. IFFCO Kisan SEZ's
// own first-party callers (src/app/blog/page.tsx, blog/[slug]/page.tsx,
// sitemap.ts) pass NEXT_PUBLIC_PORTAGE_PUBLISHABLE_KEY explicitly, same
// pattern as src/lib/submitLead.ts and PageviewTracker.tsx — not a special
// keyless default. fn_get_website_blogs/fn_get_website_blog_tags reject an
// unresolvable caller (no key, no session) outright, matching leads/
// analytics; there is deliberately no "no auth → assume tenant 1" fallback
// left in the DB functions (fixed July 2026 — that implicit default was
// fragile and easy to get wrong for any other tenant). A third-party
// caller's own x-api-key (forwarded from /api/blogs, /api/blogs/tags)
// resolves to *their* tenant instead.
function rpcClient(apiKey?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    apiKey ? { global: { headers: { 'x-api-key': apiKey } } } : undefined
  );
}

const EMPTY_PAGING: BlogListPaging = { total_records: 0, page_size: 0, page_index: 0 };

// Cross-request cache for the list RPC — this is the round trip that made
// /blog take 2-3s on every visit (there was no caching at any layer before
// this; `force-dynamic` on the page only forces per-request *rendering*, it
// doesn't disable data caching underneath). unstable_cache folds every
// argument into the cache key alongside keyParts, so apiKey (tenant) is part
// of the key automatically — two tenants calling with different keys can
// never read each other's cached entry, even though every entry shares the
// 'blog-list' tag below for bulk invalidation. Errors are thrown, not
// returned, so unstable_cache never caches a failed lookup (e.g. a bad key)
// for the TTL — only real successful envelopes get cached. TTL is a safety
// net; saveBlogPost (admin/blogs/actions.ts) busts this on-demand via
// revalidateTag on publish.
const fetchBlogList = unstable_cache(
  async (
    search: string | null,
    category: string | null,
    tags: string[] | null,
    page: number,
    pageSize: number,
    apiKey: string | null
  ): Promise<BlogListResult> => {
    const supabase = rpcClient(apiKey ?? undefined);
    const { data: envelope, error } = await supabase.rpc('fn_get_website_blogs', {
      p_published: true,
      p_search: search,
      p_category: category,
      p_tags: tags,
      p_page_index: page,
      p_page_size: pageSize,
    });
    if (error) throw error;
    return envelope as BlogListResult;
  },
  ['blog-list'],
  { tags: ['blog-list'], revalidate: 300 }
);

export async function getPublishedBlogList(params: BlogListParams = {}): Promise<BlogListResult> {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? 9, 1);
  // Sorted so filter permutations that mean the same query (e.g. the same
  // tags picked in a different order) share one cache entry instead of
  // needlessly fragmenting it.
  const tags = params.tags && params.tags.length > 0 ? [...params.tags].sort() : null;

  try {
    const raw = await fetchBlogList(
      params.search || null,
      params.category || null,
      tags,
      page,
      pageSize,
      params.apiKey ?? null
    );
    return {
      is_success: raw.is_success,
      message: raw.message,
      status_code: raw.status_code,
      data: (raw.data ?? []).map((post) => ({ ...post, cover_url: resolveCoverUrl(post.cover_url) })),
      paging: raw.paging ?? EMPTY_PAGING,
    };
  } catch (error) {
    return {
      is_success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      status_code: 500,
      data: [],
      paging: EMPTY_PAGING,
    };
  }
}

export interface BlogTagsResult {
  is_success: boolean;
  message: string;
  status_code: number;
  data: string[];
}

// Distinct tags across the tenant's published+active posts, for /blog's tag
// filter dropdown (see supabase/functions/fn_get_website_blog_tags.sql) —
// same full-envelope return shape (not a bare array) as getPublishedBlogList
// so a bad/missing x-api-key surfaces as a real error to a third-party
// integrator instead of silently looking like "this tenant just has no
// tags". IFFCO Kisan SEZ's own SSR call (src/app/blog/page.tsx) passes
// NEXT_PUBLIC_PORTAGE_PUBLISHABLE_KEY explicitly; a third-party site passes
// its own key via /api/blogs/tags so this resolves to *their* tenant's tags
// instead — see that route's comment.
export async function getPublishedBlogTags(apiKey?: string): Promise<BlogTagsResult> {
  const supabase = rpcClient(apiKey);
  const { data: envelope, error } = await supabase.rpc('fn_get_website_blog_tags');

  if (error) {
    return { is_success: false, message: error.message, status_code: 500, data: [] };
  }

  const raw = envelope as BlogTagsResult;
  return {
    is_success: raw.is_success,
    message: raw.message,
    status_code: raw.status_code,
    data: raw.data ?? [],
  };
}

export interface BlogPostResult {
  is_success: boolean;
  message: string;
  status_code: number;
  // null both when the RPC itself failed (bad key, etc. — check is_success)
  // and when it succeeded but no post matched the slug (a genuine 404) —
  // callers that need to tell those apart should check is_success first,
  // same as getPublishedBlogList/getPublishedBlogTags.
  data: BlogRow | null;
}

// Same cross-request cache treatment as fetchBlogList above, and the same
// tenant-isolation guarantee (apiKey is a call argument, so it's part of the
// cache key). Longer TTL than the list — individual posts change rarely and
// get linked/shared repeatedly, so they're the highest-value thing to cache
// — while saveBlogPost still busts this instantly via revalidateTag on
// publish, so the long TTL is just a safety net, not the freshness
// mechanism.
const fetchBlogBySlug = unstable_cache(
  async (slug: string, apiKey: string | null): Promise<BlogListResult> => {
    const supabase = rpcClient(apiKey ?? undefined);
    const { data: envelope, error } = await supabase.rpc('fn_get_website_blogs', {
      p_name: slug,
      p_published: true,
    });
    if (error) throw error;
    return envelope as BlogListResult;
  },
  ['blog-detail'],
  { tags: ['blog-detail'], revalidate: 3600 }
);

// cache() dedupes this within a single request, so generateMetadata and the
// page component (both called per-request since /blog/[slug] is dynamic)
// share one round trip instead of two, on top of fetchBlogBySlug's
// cross-request unstable_cache underneath. Returns a full envelope (not a
// bare row, and doesn't throw) — same shape as getPublishedBlogList/
// getPublishedBlogTags, so a bad/missing key surfaces its real status_code
// (e.g. 401) instead of a generic thrown error, which is what
// /api/blogs/[slug]/route.ts needs to return the correct HTTP status.
export const getPublishedBlogBySlug = cache(
  async (slug: string, apiKey?: string): Promise<BlogPostResult> => {
    try {
      const raw = await fetchBlogBySlug(slug, apiKey ?? null);
      const post = raw.is_success ? (raw.data?.[0] ?? null) : null;
      return {
        is_success: raw.is_success,
        message: raw.message,
        status_code: raw.status_code,
        data: post ? { ...post, cover_url: resolveCoverUrl(post.cover_url) } : null,
      };
    } catch (error) {
      return {
        is_success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        status_code: 500,
        data: null,
      };
    }
  }
);
