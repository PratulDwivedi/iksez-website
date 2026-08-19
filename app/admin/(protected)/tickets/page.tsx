import Link from 'next/link';
import { LifeBuoy, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TicketListTable, type TicketListRow } from '@/components/admin/TicketListTable';
import { ApiIntegrationButton } from '@/components/admin/ApiIntegrationButton';

const TICKETS_API_RESPONSE_EXAMPLE = `{
  "is_success": true,
  "message": "Ticket created successfully",
  "status_code": 200,
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "subject": "Contact form not sending emails",
      "first_name": "Jordan",
      "last_name": "Rivera",
      "email": "jordan@acme.com",
      "phone": "+1 555 0100",
      "status": "open",
      "priority": "high",
      "category": null,
      "source": "Helpline Page",
      "created_at": "2026-07-31T00:00:00+00:00"
    }
  ]
}`;

export default async function AdminTicketsPage() {
  const supabase = await createClient();

  // fn_get_website_tickets resolves the caller's tenant from the admin's own
  // JWT session (same pattern as fn_get_website_leads on /admin/leads) — see
  // supabase/functions/fn_get_website_tickets.sql. Granted to `authenticated`
  // only, no keyless fallback, since ticket contact info is PII.
  const { data: tickets, error } = await callRpc<TicketListRow[]>(supabase, 'fn_get_website_tickets', {
    p_page_size: 1000,
  });

  return (
    <>
      <AdminPageHeader
        icon={<LifeBuoy className="w-4 h-4" />}
        title="Tickets"
        subtitle="Support tickets raised from the Helpline page, integrated sites, or converted from leads."
        action={
          <>
            <ApiIntegrationButton
              title="Create Ticket API"
              description="Raise support tickets from another website into this tenant."
              method="POST"
              endpoint="/api/tickets"
              params={[
                { name: 'x-api-key', in: 'header', description: "Your tenant's publishable API key. Required.", required: true },
                { name: 'subject', in: 'body', description: 'Required.', required: true },
                { name: 'first_name', in: 'body', description: 'Required.', required: true },
                { name: 'last_name, email, phone, company, priority, category, description', in: 'body', description: 'Optional strings. priority is one of low/medium/high/urgent.' },
                { name: 'data', in: 'body', description: 'Optional freeform object for extra fields.' },
              ]}
              requestExample={`curl -X POST "https://www.iksez.com/api/tickets" \\\n  -H "x-api-key: YOUR_PUBLISHABLE_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"subject":"Site is down","first_name":"Jordan","email":"jordan@acme.com","priority":"urgent"}'`}
              responseExample={TICKETS_API_RESPONSE_EXAMPLE}
              keyNote="Required — unlike the read-only blog API, there's no keyless default here, so a missing or invalid key is rejected instead of falling back to any tenant."
            />
            <Link
              href="/admin/tickets/new"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Ticket
            </Link>
          </>
        }
      />

      <div className="px-3 sm:px-4 py-4">
        {error ? (
          <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : (
          <TicketListTable tickets={tickets ?? []} />
        )}
      </div>
    </>
  );
}
