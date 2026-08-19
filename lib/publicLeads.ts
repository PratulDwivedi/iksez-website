import { createClient } from '@supabase/supabase-js';

// Exactly what fn_create_website_lead / fn_get_website_leads return per row
// (see supabase/functions/) — passed through untouched, not reshaped into a
// bespoke frontend shape. Mirrors src/lib/publicBlogs.ts's BlogRow pattern.
export interface LeadRow {
  id: number;
  tenant_id: number;
  first_name: string;
  last_name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  job_title: string | null;
  website: string | null;
  address: Record<string, unknown> | null;
  lead_source: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  rating: 'hot' | 'warm' | 'cold' | null;
  estimated_value: number | null;
  owner_id: number | null;
  description: string | null;
  tags: string[] | null;
  converted_at: string | null;
  data: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface LeadResult {
  is_success: boolean;
  message: string;
  status_code: number;
  data: LeadRow[];
}

export interface CreateLeadParams {
  first_name: string;
  last_name?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  job_title?: string;
  website?: string;
  address?: Record<string, unknown>;
  lead_source?: string;
  estimated_value?: number;
  description?: string;
  data?: Record<string, unknown>;
  // Forwarded from the caller's own x-api-key (see src/app/api/leads/route.ts)
  // so fn_create_website_lead resolves *their* tenant. Unlike publicBlogs.ts,
  // there is no keyless default here — a lead has to belong to a real tenant,
  // never silently attributed to IFFCO Kisan SEZ's own inbox.
  apiKey: string;
}

function rpcClient(apiKey?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    apiKey ? { global: { headers: { 'x-api-key': apiKey } } } : undefined
  );
}

// fn_create_website_lead never throws to the client for business-logic
// failures (missing/invalid key, missing first_name, etc.) — those come back
// as { is_success: false, ... } via fn_response_error. Only a genuine
// transport error (network, Supabase down) throws here.
export async function createLead(params: CreateLeadParams): Promise<LeadResult> {
  const supabase = rpcClient(params.apiKey);
  const { data: envelope, error } = await supabase.rpc('fn_create_website_lead', {
    p_first_name: params.first_name,
    p_last_name: params.last_name || null,
    p_company: params.company || null,
    p_email: params.email || null,
    p_phone: params.phone || null,
    p_mobile: params.mobile || null,
    p_job_title: params.job_title || null,
    p_website: params.website || null,
    p_address: params.address ?? null,
    p_lead_source: params.lead_source || null,
    p_estimated_value: params.estimated_value ?? null,
    p_description: params.description || null,
    p_data: params.data ?? {},
  });

  if (error) {
    return { is_success: false, message: error.message, status_code: 500, data: [] };
  }

  const raw = envelope as LeadResult;
  return {
    is_success: raw.is_success,
    message: raw.message,
    status_code: raw.status_code,
    data: raw.data ?? [],
  };
}
