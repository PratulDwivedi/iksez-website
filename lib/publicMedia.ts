import { createClient } from '@supabase/supabase-js';

// Exactly what fn_list_public_website_media returns per row — a deliberately
// narrower shape than the admin's MediaRow (src/components/admin/MediaLibrary.tsx):
// no storage_path/is_public/tenant_id, since a third-party caller only ever
// needs the public URL to use, never the internal bookkeeping fields, and
// every row here is public by construction (the RPC hardcodes is_public = true).
export interface PublicMediaItem {
  id: number;
  file_name: string;
  url: string;
  mime_type: string | null;
  size_bytes: number | null;
  alt_text: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface PublicMediaListPaging {
  total_records: number;
  page_size: number;
  page_index: number;
}

export interface PublicMediaListResult {
  is_success: boolean;
  message: string;
  status_code: number;
  data: PublicMediaItem[];
  paging: PublicMediaListPaging;
}

export interface PublicMediaListParams {
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  // Forwarded from a third-party caller's own x-api-key (see
  // src/app/api/media/route.ts). Omitted entirely for IFFCO Kisan SEZ's own
  // first-party calls, same keyless-defaults-to-tenant-1 pattern as
  // src/lib/publicBlogs.ts — safe here because fn_list_public_website_media
  // is hardcoded to only ever return is_public = true rows.
  apiKey?: string;
}

const EMPTY_PAGING: PublicMediaListPaging = { total_records: 0, page_size: 0, page_index: 0 };

function rpcClient(apiKey?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    apiKey ? { global: { headers: { 'x-api-key': apiKey } } } : undefined
  );
}

export async function getPublicMediaList(params: PublicMediaListParams = {}): Promise<PublicMediaListResult> {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? 50, 1);

  const supabase = rpcClient(params.apiKey);
  const { data: envelope, error } = await supabase.rpc('fn_list_public_website_media', {
    p_tag: params.tag || null,
    p_search: params.search || null,
    p_page_index: page,
    p_page_size: pageSize,
  });

  if (error) {
    return { is_success: false, message: error.message, status_code: 500, data: [], paging: EMPTY_PAGING };
  }

  const raw = envelope as PublicMediaListResult;
  return {
    is_success: raw.is_success,
    message: raw.message,
    status_code: raw.status_code,
    data: raw.data ?? [],
    paging: raw.paging ?? EMPTY_PAGING,
  };
}
