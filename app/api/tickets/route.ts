import { NextRequest, NextResponse } from 'next/server';
import { createTicket } from '@/lib/publicTickets';

export const dynamic = 'force-dynamic';

// Public gateway: any tenant's site posts a ticket here with its own
// Publishable API Key (see /admin/settings) in the x-api-key header — same
// integration shape as /api/leads, but for support/issue tickets instead of
// sales leads. Write-only, and like /api/leads does NOT fall back to
// Portage Now's own tenant when the key is missing: fn_create_website_ticket
// requires a resolvable tenant and errors (401) otherwise.
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

  const subject = asString(body.subject) ?? '';
  if (!subject.trim()) {
    return NextResponse.json(
      { is_success: false, message: 'subject is required', status_code: 400, data: [] },
      { status: 400 }
    );
  }

  const firstName = asString(body.first_name) ?? '';
  if (!firstName.trim()) {
    return NextResponse.json(
      { is_success: false, message: 'first_name is required', status_code: 400, data: [] },
      { status: 400 }
    );
  }

  const result = await createTicket({
    apiKey,
    subject,
    first_name: firstName,
    last_name: asString(body.last_name),
    email: asString(body.email),
    phone: asString(body.phone),
    company: asString(body.company),
    priority: asString(body.priority),
    category: asString(body.category),
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
