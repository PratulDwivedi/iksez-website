import { NextRequest, NextResponse } from 'next/server';
import { getPublishedTestimonials } from '@/lib/publicTestimonials';

export const dynamic = 'force-dynamic';

// Public gateway: third-party sites call this with their own x-api-key to
// list their own tenant's testimonials — see src/lib/publicTestimonials.ts
// and supabase/functions/fn_get_website_testimonials.sql. Mirrors
// src/app/api/blogs/route.ts exactly: x-api-key is required, no keyless
// fallback (same hardened convention as blogs/leads/analytics). Response is
// the same { is_success, message, status_code, data, paging } envelope
// fn_response_success/fn_response_error produce — see admin > Testimonials
// > the API integration dialog for the documented contract.
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key') ?? undefined;

  if (!apiKey) {
    return NextResponse.json(
      { is_success: false, message: 'x-api-key header is required', status_code: 401, data: [] },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);

  const result = await getPublishedTestimonials({
    page: Number(searchParams.get('page')) || undefined,
    pageSize: Number(searchParams.get('pageSize')) || undefined,
    apiKey,
  });
  return NextResponse.json(result, { status: result.status_code || 200 });
}
