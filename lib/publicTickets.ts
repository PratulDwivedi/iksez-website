import { createClient } from '@supabase/supabase-js';

// Exactly what fn_create_website_ticket / fn_get_website_tickets return per
// row (see supabase/functions/) — passed through untouched, not reshaped
// into a bespoke frontend shape. Mirrors src/lib/publicLeads.ts's LeadRow
// pattern.
export interface TicketRow {
  id: number;
  tenant_id: number;
  subject: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent' | null;
  category: string | null;
  source: string | null;
  first_name: string;
  last_name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  lead_id: number | null;
  owner_id: number | null;
  resolved_at: string | null;
  data: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface TicketResult {
  is_success: boolean;
  message: string;
  status_code: number;
  data: TicketRow[];
}

export interface CreateTicketParams {
  subject: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  priority?: string;
  category?: string;
  description?: string;
  data?: Record<string, unknown>;
  // Forwarded from the caller's own x-api-key (see src/app/api/tickets/route.ts)
  // so fn_create_website_ticket resolves *their* tenant. Same reasoning as
  // publicLeads.ts's CreateLeadParams — no keyless default, a ticket has to
  // belong to a real tenant.
  apiKey: string;
}

function rpcClient(apiKey?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    apiKey ? { global: { headers: { 'x-api-key': apiKey } } } : undefined
  );
}

// fn_create_website_ticket never throws to the client for business-logic
// failures (missing/invalid key, missing subject/first_name, etc.) — those
// come back as { is_success: false, ... } via fn_response_error. Only a
// genuine transport error (network, Supabase down) throws here.
export async function createTicket(params: CreateTicketParams): Promise<TicketResult> {
  const supabase = rpcClient(params.apiKey);
  const { data: envelope, error } = await supabase.rpc('fn_create_website_ticket', {
    p_subject: params.subject,
    p_first_name: params.first_name,
    p_last_name: params.last_name || null,
    p_email: params.email || null,
    p_phone: params.phone || null,
    p_company: params.company || null,
    p_priority: params.priority || null,
    p_category: params.category || null,
    p_description: params.description || null,
    p_data: params.data ?? {},
  });

  if (error) {
    return { is_success: false, message: error.message, status_code: 500, data: [] };
  }

  const raw = envelope as TicketResult;
  return {
    is_success: raw.is_success,
    message: raw.message,
    status_code: raw.status_code,
    data: raw.data ?? [],
  };
}
