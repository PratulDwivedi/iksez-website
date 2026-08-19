import Link from 'next/link';
import { Users, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LeadListTable, type LeadListRow } from '@/components/admin/LeadListTable';
import { ApiIntegrationButton } from '@/components/admin/ApiIntegrationButton';

const LEADS_API_RESPONSE_EXAMPLE = `{
  "is_success": true,
  "message": "Lead created successfully",
  "status_code": 200,
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "first_name": "Jordan",
      "last_name": "Rivera",
      "company": "Acme Co",
      "email": "jordan@acme.com",
      "phone": "+1 555 0100",
      "status": "new",
      "rating": null,
      "estimated_value": null,
      "lead_source": "website form",
      "created_at": "2026-07-30T00:00:00+00:00"
    }
  ]
}`;

export default async function AdminLeadsPage() {
  const supabase = await createClient();

  // fn_get_website_leads resolves the caller's tenant from the admin's own
  // JWT session (same pattern as fn_get_website_blogs on /admin/blogs) — see
  // supabase/functions/fn_get_website_leads.sql. Unlike blogs, this function
  // is granted to `authenticated` only (not `anon`) and has no keyless
  // fallback, since lead data is private PII, not public content.
  const { data: leads, error } = await callRpc<LeadListRow[]>(supabase, 'fn_get_website_leads', {
    p_page_size: 1000,
  });

  // A lead converted into a ticket (via "Convert to Ticket" — see
  // fn_convert_lead_to_website_ticket.sql) is marked status: 'converted' but
  // deliberately left is_active: true and still readable by id, so the
  // ticket's "View lead" back-link (TicketForm.tsx) keeps working. It's
  // filtered out of this list view only, not deactivated at the DB level.
  const activeLeads = (leads ?? []).filter((lead) => lead.status !== 'converted');

  return (
    <>
      <AdminPageHeader
        icon={<Users className="w-4 h-4" />}
        title="Leads"
        subtitle="Leads captured from your own site and integrated third-party sites."
        action={
          <>
            <ApiIntegrationButton
              title="Create Lead API"
              description="Capture leads from another website into this tenant."
              method="POST"
              endpoint="/api/leads"
              params={[
                { name: 'x-api-key', in: 'header', description: "Your tenant's publishable API key. Required.", required: true },
                { name: 'first_name', in: 'body', description: 'Required.', required: true },
                { name: 'last_name, company, email, phone, mobile, job_title, website, lead_source, description', in: 'body', description: 'Optional strings.' },
                { name: 'address', in: 'body', description: 'Optional object, e.g. { "city": "Noida" }.' },
                { name: 'estimated_value', in: 'body', description: 'Optional number.' },
                { name: 'data', in: 'body', description: 'Optional freeform object for extra fields.' },
              ]}
              requestExample={`curl -X POST "https://www.iksez.com/api/leads" \\\n  -H "x-api-key: YOUR_PUBLISHABLE_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"first_name":"Jordan","last_name":"Rivera","email":"jordan@acme.com","lead_source":"website form"}'`}
              responseExample={LEADS_API_RESPONSE_EXAMPLE}
              keyNote="Required — unlike the read-only blog API, there's no keyless default here, so a missing or invalid key is rejected instead of falling back to any tenant."
            />
            <Link
              href="/admin/leads/new"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Lead
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
          <LeadListTable leads={activeLeads} />
        )}
      </div>
    </>
  );
}
