import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Exactly what fn_get_website_testimonials returns per row (see
// supabase/functions/fn_get_website_testimonials.sql) — passed through
// untouched to API consumers, same "generic passthrough, don't reshape"
// convention as BlogRow in src/lib/publicBlogs.ts.
export interface TestimonialRow {
  id: number;
  quote: string;
  author_name: string;
  author_role: string | null;
  company: string | null;
  avatar_url: string | null;
  rating: number;
  display_order: number;
  published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestimonialListPaging {
  total_records: number;
  page_size: number;
  page_index: number;
}

// Same envelope shape as BlogListResult/fn_response_success — see
// src/lib/publicBlogs.ts's comment on why this stays generic.
export interface TestimonialListResult {
  is_success: boolean;
  message: string;
  status_code: number;
  data: TestimonialRow[];
  paging: TestimonialListPaging;
}

export interface TestimonialListParams {
  page?: number;
  pageSize?: number;
  // Forwarded from a third-party caller's own x-api-key (see
  // src/app/api/testimonials/route.ts) so fn_get_website_testimonials
  // resolves *their* tenant instead of IFFCO Kisan SEZ's.
  apiKey?: string;
}

// No cookies/session — server-to-server RPC, tenant resolution driven
// entirely by apiKey, same as rpcClient() in publicBlogs.ts.
function rpcClient(apiKey?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    apiKey ? { global: { headers: { 'x-api-key': apiKey } } } : undefined
  );
}

const EMPTY_PAGING: TestimonialListPaging = { total_records: 0, page_size: 0, page_index: 0 };

// Cross-request cache, same shape as fetchBlogList in publicBlogs.ts —
// apiKey is folded into the cache key via keyParts, so two tenants can never
// read each other's cached entry despite sharing the 'testimonial-list' tag
// used for bulk invalidation. saveTestimonial (admin actions.ts) busts this
// on-demand via revalidateTag on save; the TTL here is just a safety net.
const fetchTestimonialList = unstable_cache(
  async (page: number, pageSize: number, apiKey: string | null): Promise<TestimonialListResult> => {
    const supabase = rpcClient(apiKey ?? undefined);
    const { data: envelope, error } = await supabase.rpc('fn_get_website_testimonials', {
      p_published: true,
      p_page_index: page,
      p_page_size: pageSize,
    });
    if (error) throw error;
    return envelope as TestimonialListResult;
  },
  ['testimonial-list'],
  { tags: ['testimonial-list'], revalidate: 300 }
);

export async function getPublishedTestimonials(
  params: TestimonialListParams = {}
): Promise<TestimonialListResult> {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? 50, 1);

  try {
    const raw = await fetchTestimonialList(page, pageSize, params.apiKey ?? null);
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
