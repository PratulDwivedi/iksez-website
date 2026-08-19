import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { LeadForm, type LeadFormLead } from '@/components/admin/LeadForm';

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // fn_get_website_leads (not a direct table select) even for a single
  // record — website_leads has RLS enabled with zero policies (see
  // supabase/README.md), so this RPC is the only read path, and it's what
  // scopes the lookup to the admin's own tenant.
  const { data: leads } = await callRpc<LeadFormLead[]>(supabase, 'fn_get_website_leads', {
    p_id: Number(id),
  });
  const lead = leads?.[0];

  if (!lead) {
    notFound();
  }

  return <LeadForm lead={lead} />;
}
