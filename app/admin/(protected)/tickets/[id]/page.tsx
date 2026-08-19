import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { TicketForm, type TicketFormTicket } from '@/components/admin/TicketForm';

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // fn_get_website_tickets (not a direct table select) even for a single
  // record — website_tickets has RLS enabled with zero policies (see
  // supabase/README.md), so this RPC is the only read path, and it's what
  // scopes the lookup to the admin's own tenant.
  const { data: tickets } = await callRpc<TicketFormTicket[]>(supabase, 'fn_get_website_tickets', {
    p_id: Number(id),
  });
  const ticket = tickets?.[0];

  if (!ticket) {
    notFound();
  }

  return <TicketForm ticket={ticket} />;
}
