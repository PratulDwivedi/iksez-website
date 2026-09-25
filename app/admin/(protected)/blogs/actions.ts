'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { textToBlocks } from '@/lib/blogBody';
import { textToFaqs } from '@/lib/blogFaq';
import { translationLocales, translationField } from '@/lib/blogTranslations';
import { localeLabels } from '@/lib/i18n/config';

export async function saveBlogPost(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const idRaw = formData.get('id') as string;
  const readMinutesRaw = formData.get('read_minutes') as string;
  const categoryIdRaw = formData.get('category_id') as string;
  const faqs = textToFaqs((formData.get('faqs') as string) ?? '');

  // Validate every translation tab before writing anything, so a half-filled
  // translation can't leave the English post saved and the translation not.
  const translations = translationLocales.map((locale) => readTranslation(formData, locale));
  for (const t of translations) {
    if (t.filled && (!t.title || !t.excerpt || t.body.length === 0)) {
      return {
        error: `${localeLabels[t.locale].english} translation needs a title, excerpt and body — or clear all of its fields to remove it.`,
      };
    }
  }

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
    // Explicit null, never omitted: the function's p_published_at defaults to
    // now(), so leaving it out reset the publish date on every edit. With
    // null it keeps the existing date on update and uses now() on insert.
    p_published_at: null,
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

  // fn_save_website_blog returns the saved row wrapped in a one-element array.
  const savedRow = Array.isArray(data) ? data[0] : data;
  const savedId = (savedRow as { id: number } | null)?.id;

  let translationError: string | null = null;
  if (savedId) {
    for (const t of translations) {
      const result = t.filled
        ? await callRpc(supabase, 'fn_save_website_blog_translation', {
            p_blog_id: savedId,
            p_locale: t.locale,
            p_title: t.title,
            p_excerpt: t.excerpt,
            p_cover_alt: t.coverAlt || null,
            p_body: t.body,
            p_data: { faqs: t.faqs },
            p_published: t.published,
          })
        : t.existed
          ? await callRpc(supabase, 'fn_delete_website_blog_translation', {
              p_blog_id: savedId,
              p_locale: t.locale,
            })
          : { error: null };
      if (result.error) {
        translationError = `Post saved, but the ${localeLabels[t.locale].english} translation wasn't: ${result.error}`;
        break;
      }
    }
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
  // Marketing routes live under app/(marketing)/[lang]/ and are reached via
  // a proxy.ts rewrite, so revalidatePath needs the route file path
  // ("/[lang]/...", every locale at once), not the public URL.
  revalidatePath('/[lang]/blog', 'page');
  revalidatePath('/[lang]/blog/[slug]', 'page');

  if (translationError) {
    // An existing post stays on the form with the error, keeping the typed
    // translation. A new post has to move to its edit page — resubmitting the
    // "new" form would try to create the (already created) slug again.
    if (idRaw || !savedId) return { error: translationError };
    redirect(`/admin/blogs/${savedId}/?error=${encodeURIComponent(translationError)}`);
  }

  redirect(savedId ? `/admin/blogs/${savedId}/` : '/admin/blogs/');
}

function readTranslation(formData: FormData, locale: (typeof translationLocales)[number]) {
  const get = (field: string) => ((formData.get(translationField(locale, field)) as string) ?? '').trim();
  const title = get('title');
  const excerpt = get('excerpt');
  const coverAlt = get('cover_alt');
  const bodyText = get('body');
  const faqsText = get('faqs');

  return {
    locale,
    title,
    excerpt,
    coverAlt,
    body: textToBlocks(bodyText),
    faqs: textToFaqs(faqsText),
    published: formData.get(translationField(locale, 'published')) === 'on',
    existed: get('existed') === '1',
    // Any typed content counts; the published checkbox alone doesn't.
    filled: Boolean(title || excerpt || coverAlt || bodyText || faqsText),
  };
}

function splitCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}
