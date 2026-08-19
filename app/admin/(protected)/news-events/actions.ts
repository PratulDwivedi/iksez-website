'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { textToBlocks } from '@/lib/blogBody';
import { textToGallery } from '@/lib/newsEventGallery';

export async function saveNewsEvent(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const idRaw = formData.get('id') as string;
  const eventDateRaw = (formData.get('event_date') as string) || null;

  const { data, error } = await callRpc(supabase, 'fn_save_website_news_event', {
    p_id: idRaw ? Number(idRaw) : null,
    p_title: formData.get('title'),
    p_event_date: eventDateRaw,
    p_body: textToBlocks((formData.get('body') as string) ?? ''),
    p_gallery: textToGallery((formData.get('gallery') as string) ?? ''),
    p_published: formData.get('published') === 'on',
  });

  if (error) {
    return { error };
  }

  revalidatePath('/admin/news-events');
  // Same reasoning as saveBlogPost (see that action's comment): this action
  // is shared by every tenant's admin, but /news-and-events in *this*
  // Next.js app only ever renders IFFCO Kisan SEZ's own tenant, so busting
  // this tag/path unconditionally on every save is safe.
  revalidateTag('news-events-list', 'max');
  revalidatePath('/news-and-events');

  const savedId = (data as { id: number } | null)?.id;
  redirect(savedId ? `/admin/news-events/${savedId}/` : '/admin/news-events/');
}
