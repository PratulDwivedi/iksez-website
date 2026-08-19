import { NextRequest, NextResponse } from 'next/server';
import { getPublishedBlogTags } from '@/lib/publicBlogs';

export const dynamic = 'force-dynamic';

// Public gateway, same shape/pattern as /api/blogs (see that route's
// comment): a third-party site hits this with its own x-api-key to get its
// own tenant's distinct tag list for a filter dropdown like /blog's own —
// see supabase/functions/fn_get_website_blog_tags.sql. x-api-key is
// required, no keyless fallback (same as /api/blogs). Portage Now's own
// /blog page doesn't go through this HTTP route either — it calls
// getPublishedBlogTags() directly, with its key passed explicitly
// (src/app/blog/page.tsx).
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key') ?? undefined;

  if (!apiKey) {
    return NextResponse.json(
      { is_success: false, message: 'x-api-key header is required', status_code: 401, data: [] },
      { status: 401 }
    );
  }

  const result = await getPublishedBlogTags(apiKey);
  return NextResponse.json(result, { status: result.status_code || 200 });
}
