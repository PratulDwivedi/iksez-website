import { NextRequest, NextResponse } from 'next/server';
import { getPublishedBlogList } from '@/lib/publicBlogs';

export const dynamic = 'force-dynamic';

// Public gateway: third-party sites call this with their own x-api-key to
// list their own tenant's blogs — see src/lib/publicBlogs.ts and
// supabase/functions/fn_get_website_blogs.sql. (portagenow.com's own /blog
// page doesn't go through this HTTP route at all — it calls
// getPublishedBlogList() directly from src/app/blog/page.tsx, passing
// NEXT_PUBLIC_PORTAGE_PUBLISHABLE_KEY explicitly.) x-api-key is required —
// same shape as /api/leads: no keyless fallback at any layer (neither here
// nor inside fn_get_website_blogs, which now errors on unresolvable auth
// instead of defaulting to any tenant). Response is the same
// { is_success, message, status_code, data, paging } envelope
// fn_response_success/fn_response_error produce — see admin > Blogs > the
// API integration dialog for the documented contract.
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key') ?? undefined;

  if (!apiKey) {
    return NextResponse.json(
      { is_success: false, message: 'x-api-key header is required', status_code: 401, data: [] },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const tags = searchParams.get('tags');

  const result = await getPublishedBlogList({
    search: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    page: Number(searchParams.get('page')) || undefined,
    pageSize: Number(searchParams.get('pageSize')) || undefined,
    apiKey,
  });
  return NextResponse.json(result, { status: result.status_code || 200 });
}
