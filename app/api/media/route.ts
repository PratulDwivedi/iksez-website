import { NextRequest, NextResponse } from 'next/server';
import { getPublicMediaList } from '@/lib/publicMedia';

export const dynamic = 'force-dynamic';

// Public gateway: portagenow.com's own pages call this with no x-api-key
// (fn_list_public_website_media defaults a keyless caller to Portage Now's
// tenant), and third-party sites call it with their own x-api-key to pull
// their own tenant's PUBLIC media into their pages — see admin > Media > the
// API integration dialog. Same envelope shape as /api/blogs. Private media
// (uploaded with "Private" selected in /admin/media) never appears here.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getPublicMediaList({
    tag: searchParams.get('tag') ?? undefined,
    search: searchParams.get('q') ?? undefined,
    page: Number(searchParams.get('page')) || undefined,
    pageSize: Number(searchParams.get('pageSize')) || undefined,
    apiKey: request.headers.get('x-api-key') ?? undefined,
  });
  return NextResponse.json(result, { status: result.status_code || 200 });
}
