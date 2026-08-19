import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/publicLeads';

export const dynamic = 'force-dynamic';

// Public gateway: any tenant's site posts a lead here with its own
// Publishable API Key (see /admin/settings) in the x-api-key header — same
// integration shape as /api/blogs (see admin > Leads > the API integration
// dialog for the documented contract), but write-only and, unlike
// /api/blogs, does NOT fall back to Portage Now's own tenant when the key is
// missing: fn_create_website_lead requires a resolvable tenant and errors
// (401) otherwise, so a lead can never be silently misattributed.
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key') ?? undefined;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { is_success: false, message: 'Invalid JSON body', status_code: 400, data: [] },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { is_success: false, message: 'x-api-key header is required', status_code: 401, data: [] },
      { status: 401 }
    );
  }

  const firstName = asString(body.first_name) ?? '';
  if (!firstName.trim()) {
    return NextResponse.json(
      { is_success: false, message: 'first_name is required', status_code: 400, data: [] },
      { status: 400 }
    );
  }

  const result = await createLead({
    apiKey,
    first_name: firstName,
    last_name: asString(body.last_name),
    company: asString(body.company),
    email: asString(body.email),
    phone: asString(body.phone),
    mobile: asString(body.mobile),
    job_title: asString(body.job_title),
    website: asString(body.website),
    address: isPlainObject(body.address) ? body.address : undefined,
    lead_source: asString(body.lead_source),
    estimated_value: typeof body.estimated_value === 'number' ? body.estimated_value : undefined,
    description: asString(body.description),
    data: isPlainObject(body.data) ? body.data : undefined,
  });

  return NextResponse.json(result, { status: result.status_code || 200 });
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
