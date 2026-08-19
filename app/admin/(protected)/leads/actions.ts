'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';

export async function saveLead(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const idRaw = formData.get('id') as string;
  const estimatedValueRaw = formData.get('estimated_value') as string;
  const ownerIdRaw = formData.get('owner_id') as string;
  const convertedAtRaw = formData.get('converted_at') as string;
  const ratingRaw = (formData.get('rating') as string) || '';

  const address = buildAddress(formData);

  const { data, error } = await callRpc(supabase, 'fn_save_website_lead', {
    p_id: idRaw ? Number(idRaw) : null,
    p_first_name: formData.get('first_name'),
    p_last_name: formData.get('last_name') || null,
    p_company: formData.get('company') || null,
    p_email: formData.get('email') || null,
    p_phone: formData.get('phone') || null,
    p_mobile: formData.get('mobile') || null,
    p_job_title: formData.get('job_title') || null,
    p_website: formData.get('website') || null,
    p_address: address,
    p_lead_source: formData.get('lead_source') || null,
    p_status: formData.get('status') || 'new',
    p_rating: ratingRaw || null,
    p_estimated_value: estimatedValueRaw ? Number(estimatedValueRaw) : null,
    p_owner_id: ownerIdRaw ? Number(ownerIdRaw) : null,
    p_description: formData.get('description') || null,
    p_tags: splitCsv(formData.get('tags') as string),
    p_converted_at: convertedAtRaw ? new Date(convertedAtRaw).toISOString() : null,
  });

  if (error) {
    return { error };
  }

  revalidatePath('/admin/leads');
  const savedId = (data as { id: number } | null)?.id;
  redirect(savedId ? `/admin/leads/${savedId}/` : '/admin/leads/');
}

export async function deleteLead(id: number): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Soft delete only (fn_delete_website_lead flips is_active to false) —
  // fn_get_website_leads already filters is_active, so the row just stops
  // appearing rather than being destroyed.
  const { error } = await callRpc(supabase, 'fn_delete_website_lead', { p_id: id });

  if (error) {
    return { error };
  }

  revalidatePath('/admin/leads');
  redirect('/admin/leads/');
}

function splitCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function buildAddress(formData: FormData): Record<string, string> | null {
  const fields = ['address_line', 'city', 'state', 'postal_code', 'country'] as const;
  const address: Record<string, string> = {};
  for (const field of fields) {
    const value = (formData.get(field) as string)?.trim();
    if (value) address[field] = value;
  }
  return Object.keys(address).length > 0 ? address : null;
}
