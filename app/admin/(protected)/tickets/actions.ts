'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';

export async function saveTicket(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const idRaw = formData.get('id') as string;
  const ownerIdRaw = formData.get('owner_id') as string;
  const resolvedAtRaw = formData.get('resolved_at') as string;
  const priorityRaw = (formData.get('priority') as string) || '';

  const { data, error } = await callRpc(supabase, 'fn_save_website_ticket', {
    p_id: idRaw ? Number(idRaw) : null,
    p_subject: formData.get('subject'),
    p_description: formData.get('description') || null,
    p_first_name: formData.get('first_name'),
    p_last_name: formData.get('last_name') || null,
    p_email: formData.get('email') || null,
    p_phone: formData.get('phone') || null,
    p_company: formData.get('company') || null,
    p_status: formData.get('status') || 'open',
    p_priority: priorityRaw || null,
    p_category: formData.get('category') || null,
    p_owner_id: ownerIdRaw ? Number(ownerIdRaw) : null,
    p_resolved_at: resolvedAtRaw ? new Date(resolvedAtRaw).toISOString() : null,
  });

  if (error) {
    return { error };
  }

  revalidatePath('/admin/tickets');
  const savedId = (data as { id: number } | null)?.id;
  redirect(savedId ? `/admin/tickets/${savedId}/` : '/admin/tickets/');
}

// Moves an existing lead into a new linked ticket in one atomic DB call (see
// supabase/functions/fn_convert_lead_to_website_ticket.sql) — invoked from
// the "Convert to Ticket" row action on /admin/leads' LeadListTable.
export async function convertLeadToTicket(formData: FormData) {
  const supabase = await createClient();
  const leadId = Number(formData.get('lead_id'));

  const { data, error } = await callRpc<{ id: number }>(
    supabase,
    'fn_convert_lead_to_website_ticket',
    { p_lead_id: leadId }
  );

  revalidatePath('/admin/leads');
  revalidatePath('/admin/tickets');

  if (error || !data) {
    redirect(`/admin/leads/?error=${encodeURIComponent(error ?? 'Conversion failed')}`);
  }

  redirect(`/admin/tickets/${data.id}/`);
}
