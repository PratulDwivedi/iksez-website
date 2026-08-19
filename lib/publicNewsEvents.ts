import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { BlogBlock } from '@/lib/blogBody';
import type { GalleryImage } from '@/lib/newsEventGallery';

// Exactly what fn_get_website_news_events returns per row — passed through
// untouched, same convention as lib/publicBlogs.ts's BlogRow.
export interface NewsEventRow {
  id: number;
  title: string;
  event_date: string | null;
  body: BlogBlock[];
  gallery: GalleryImage[];
  published: boolean;
  is_active: boolean;
  data: Record<string, unknown>;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface NewsEventListPaging {
  total_records: number;
  page_size: number;
  page_index: number;
}

export interface NewsEventListResult {
  is_success: boolean;
  message: string;
  status_code: number;
  data: NewsEventRow[];
  paging: NewsEventListPaging;
}

export interface NewsEventListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  // First-party callers pass this site's own NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY
  // explicitly (see app/(marketing)/news-and-events/page.tsx) — same pattern
  // as lib/publicBlogs.ts, no keyless default.
  apiKey?: string;
}

// Server-to-server RPC client, no cookies/session — identical shape to
// lib/publicBlogs.ts's rpcClient.
function rpcClient(apiKey?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    apiKey ? { global: { headers: { 'x-api-key': apiKey } } } : undefined
  );
}

const EMPTY_PAGING: NewsEventListPaging = { total_records: 0, page_size: 0, page_index: 0 };

// Cross-request cache, same tag/TTL convention as lib/publicBlogs.ts's
// fetchBlogList — saveNewsEvent (admin/news-events/actions.ts) busts this
// on-demand via revalidateTag on save, the 300s TTL is a safety net.
const fetchNewsEventList = unstable_cache(
  async (search: string | null, page: number, pageSize: number, apiKey: string | null): Promise<NewsEventListResult> => {
    const supabase = rpcClient(apiKey ?? undefined);
    const { data: envelope, error } = await supabase.rpc('fn_get_website_news_events', {
      p_published: true,
      p_search: search,
      p_page_index: page,
      p_page_size: pageSize,
    });
    if (error) throw error;
    return envelope as NewsEventListResult;
  },
  ['news-events-list'],
  { tags: ['news-events-list'], revalidate: 300 }
);

export async function getPublishedNewsEventList(params: NewsEventListParams = {}): Promise<NewsEventListResult> {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? 20, 1);

  try {
    const raw = await fetchNewsEventList(params.search || null, page, pageSize, params.apiKey ?? null);
    return {
      is_success: raw.is_success,
      message: raw.message,
      status_code: raw.status_code,
      data: raw.data ?? [],
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
