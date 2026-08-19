'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { textToBlocks } from '@/lib/blogBody';
import { textToFaqs } from '@/lib/blogFaq';

export async function saveBlogPost(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const idRaw = formData.get('id') as string;
  const readMinutesRaw = formData.get('read_minutes') as string;
  const categoryIdRaw = formData.get('category_id') as string;
  const faqs = textToFaqs((formData.get('faqs') as string) ?? '');

  const { data, error } = await callRpc(supabase, 'fn_save_website_blog', {
    p_id: idRaw ? Number(idRaw) : null,
    p_name: formData.get('name'),
    p_title: formData.get('title'),
    p_excerpt: formData.get('excerpt'),
    p_category_id: categoryIdRaw ? Number(categoryIdRaw) : null,
    p_cover_url: formData.get('cover_url'),
    p_cover_alt: formData.get('cover_alt'),
    p_tags: splitCsv(formData.get('tags') as string),
    p_keywords: splitCsv(formData.get('keywords') as string),
    p_author_name: formData.get('author_name'),
    p_author_role: formData.get('author_role') || null,
    p_read_minutes: readMinutesRaw ? Number(readMinutesRaw) : 5,
    p_body: textToBlocks((formData.get('body') as string) ?? ''),
    p_published: formData.get('published') === 'on',
    // Always pass p_data (never null) so clearing the FAQ textarea actually
    // clears data.faqs on save — fn_save_website_blog's update branch does
    // `data = COALESCE(p_data, wb.data)`, so a null here would silently
    // preserve stale FAQs instead. data.faqs is the only field this form
    // manages; if a second data.* field is ever added, this will need to
    // merge rather than overwrite.
    p_data: { faqs },
  });

  if (error) {
    return { error };
  }

  revalidatePath('/admin/blogs');

  // This action is shared by every tenant's admin (multi-tenant Supabase
  // table, see CLAUDE.md), but /blog and /blog/[slug] in *this* Next.js app
  // only ever render IFFCO Kisan SEZ's own tenant (both pages pass the hardcoded
  // NEXT_PUBLIC_PORTAGE_PUBLISHABLE_KEY, never the saving admin's own key).
  // So busting these two tags/paths unconditionally on every save is safe —
  // worst case a different tenant's save wastes one extra Supabase round
  // trip refreshing IFFCO Kisan SEZ's already-fresh cache, it can never revive
  // stale or cross-tenant data (src/lib/publicBlogs.ts's unstable_cache
  // entries are keyed per-apiKey regardless of this shared tag).
  // Next 16 requires a second "profile" argument on revalidateTag — 'max'
  // reproduces the old single-arg behavior (immediate full purge, no
  // stale-while-revalidate window), which is what we want here.
  revalidateTag('blog-list', 'max');
  revalidateTag('blog-detail', 'max');
  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');

  const savedId = (data as { id: number } | null)?.id;
  redirect(savedId ? `/admin/blogs/${savedId}/` : '/admin/blogs/');
}

function splitCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}
