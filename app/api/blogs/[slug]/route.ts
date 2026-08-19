import { NextRequest, NextResponse } from 'next/server';
import { getPublishedBlogBySlug } from '@/lib/publicBlogs';

export const dynamic = 'force-dynamic';

// Public gateway for a single post by slug — the detail-page counterpart to
// /api/blogs (list) and /api/blogs/tags, closing the "no public detail
// endpoint" gap noted in README.md's Integrations section. Same auth shape
// as its siblings: x-api-key required, no keyless fallback.
//
// Next.js route resolution note: this dynamic [slug] segment and the
// static /api/blogs/tags route are siblings under src/app/api/blogs/ — the
// static route always wins for the exact path "tags" (Next.js matches
// static segments before dynamic ones at the same level), so a real post
// slug literally named "tags" would be unreachable through this endpoint.
// Not addressed here since website_blogs.name is admin-authored, not
// user input — if it ever matters, rename the tags route instead of
// reworking this one.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const apiKey = request.headers.get('x-api-key') ?? undefined;

  if (!apiKey) {
    return NextResponse.json(
      { is_success: false, message: 'x-api-key header is required', status_code: 401, data: [] },
      { status: 401 }
    );
  }

  const { slug } = await params;
  const result = await getPublishedBlogBySlug(slug, apiKey);

  if (!result.is_success) {
    return NextResponse.json(
      { is_success: false, message: result.message, status_code: result.status_code, data: [] },
      { status: result.status_code || 500 }
    );
  }

  if (!result.data) {
    return NextResponse.json(
      { is_success: false, message: 'Blog post not found', status_code: 404, data: [] },
      { status: 404 }
    );
  }

  return NextResponse.json({
    is_success: true,
    message: 'Website blog retrieved successfully',
    status_code: 200,
    data: [result.data],
  });
}
