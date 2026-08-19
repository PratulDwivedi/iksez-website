'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';

export async function saveTestimonial(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const idRaw = formData.get('id') as string;
  const ratingRaw = formData.get('rating') as string;
  const displayOrderRaw = formData.get('display_order') as string;

  const { data, error } = await callRpc(supabase, 'fn_save_website_testimonial', {
    p_id: idRaw ? Number(idRaw) : null,
    p_quote: formData.get('quote'),
    p_author_name: formData.get('author_name'),
    p_author_role: formData.get('author_role') || null,
    p_company: formData.get('company') || null,
    p_avatar_url: formData.get('avatar_url') || null,
    p_rating: ratingRaw ? Number(ratingRaw) : 5,
    p_display_order: displayOrderRaw ? Number(displayOrderRaw) : 0,
    p_published: formData.get('published') === 'on',
  });

  if (error) {
    return { error };
  }

  revalidatePath('/admin/testimonials');

  // Same unconditional-busting reasoning as saveBlogPost in
  // src/app/admin/(protected)/blogs/actions.ts: this action is shared by
  // every tenant's admin, but the homepage's TestimonialsSection only ever
  // renders IFFCO Kisan SEZ's own tenant (passes NEXT_PUBLIC_PORTAGE_PUBLISHABLE_KEY
  // explicitly), so busting this tag/path on every save is safe regardless of
  // which tenant saved — it can never revive stale or cross-tenant data.
  revalidateTag('testimonial-list', 'max');
  revalidatePath('/');

  const savedId = (data as { id: number } | null)?.id;
  redirect(savedId ? `/admin/testimonials/${savedId}/` : '/admin/testimonials/');
}
