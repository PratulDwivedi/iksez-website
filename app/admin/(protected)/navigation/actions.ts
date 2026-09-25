'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { localeLabels } from '@/lib/i18n/config';
import { translationLocales } from '@/lib/blogTranslations';
import { NAV_CACHE_TAG } from '@/lib/publicNav';
import { DOCUMENTS_BUCKET, RESERVED_TOP_LEVEL_SLUGS, SLUG_PATTERN } from '@/lib/navTree';
import type { AdminNavItem, NavItemInput } from '@/lib/adminNav';

type ActionResult = { error: string | null; id?: number };

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

// The header on every marketing page shows the nav, so any change refreshes
// the whole [lang] layout (both locales), plus the cached nav lookup
// (lib/publicNav.ts) and the sitemap's view of it. Marketing routes are
// reached through a proxy.ts rewrite, so revalidatePath takes the route file
// path, not the public URL.
function revalidateNav() {
  revalidateTag(NAV_CACHE_TAG, 'max');
  revalidatePath('/[lang]', 'layout');
  revalidatePath('/admin/navigation');
}

// Best effort: a PDF that can't be removed only wastes storage, it never
// breaks the site, so a failure here doesn't fail the save/delete.
async function removeFiles(supabase: SupabaseServer, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).remove(paths);
  if (error) console.error('[navigation] removing replaced PDFs failed:', error.message);
}

function filePathsOf(item: Pick<AdminNavItem, 'file_path' | 'translations'> | undefined): string[] {
  if (!item) return [];
  return [item.file_path, ...item.translations.map((t) => t.file_path)].filter((p): p is string => Boolean(p));
}

export async function saveNavItem(input: NavItemInput): Promise<ActionResult> {
  const supabase = await createClient();

  const slug = input.slug.trim().toLowerCase();
  const title = input.title.trim();
  if (!title) return { error: 'Title is required.' };
  if (!SLUG_PATTERN.test(slug)) {
    return { error: 'Slug may only contain lowercase letters, numbers and single hyphens.' };
  }
  // A top-level page/document shares its URL with the coded routes; one that
  // collides would never be reachable.
  if (
    input.parent_id === null &&
    input.kind !== 'link' &&
    (RESERVED_TOP_LEVEL_SLUGS as readonly string[]).includes(slug)
  ) {
    return { error: `"/${slug}/" is already a page of the website. Choose another slug, or make this a link to it.` };
  }
  if (input.kind === 'link' && !input.href.trim()) return { error: 'A link needs a route or URL.' };
  if (input.kind === 'document' && !input.file_path) return { error: 'Upload the English PDF first.' };

  for (const t of input.translations) {
    const hasContent = Boolean(t.title.trim() || t.description.trim() || t.body_html.trim() || t.file_path);
    if (hasContent && !t.title.trim()) {
      return {
        error: `${localeLabels[t.locale].english} needs a title — or clear all of its fields to remove the translation.`,
      };
    }
  }

  // The stored item before this save, to find PDFs this save stops using.
  const { data: existingItems, error: loadError } = await callRpc<AdminNavItem[]>(supabase, 'fn_get_website_nav_items');
  if (loadError) return { error: loadError };
  const previous = input.id ? existingItems?.find((item) => item.id === input.id) : undefined;
  if (input.id && !previous) return { error: 'This item no longer exists. Reload the page.' };

  // Only the field that belongs to the kind is kept, so switching an item's
  // kind doesn't leave a stale body/PDF/route behind.
  const { data, error } = await callRpc<{ id: number }[]>(supabase, 'fn_save_website_nav_item', {
    p_id: input.id,
    p_parent_id: input.parent_id,
    p_slug: slug,
    p_kind: input.kind,
    p_title: title,
    p_description: input.description.trim() || null,
    p_href: input.kind === 'link' ? input.href.trim() : null,
    p_body_html: input.kind === 'page' ? input.body_html : null,
    p_file_path: input.kind === 'document' ? input.file_path : null,
    p_file_name: input.kind === 'document' ? input.file_name : null,
    p_open_in_new_tab: input.kind === 'page' ? false : input.open_in_new_tab,
    p_show_in_menu: input.show_in_menu,
    p_published: input.published,
  });
  if (error) return { error };
  const savedId = data?.[0]?.id;
  if (!savedId) return { error: 'Save returned no item.' };

  const keptFiles = new Set<string>();
  if (input.kind === 'document' && input.file_path) keptFiles.add(input.file_path);

  let translationError: string | null = null;
  for (const locale of translationLocales) {
    const t = input.translations.find((tr) => tr.locale === locale);
    const existed = previous?.translations.some((tr) => tr.locale === locale) ?? false;
    const result = t?.title.trim()
      ? await callRpc(supabase, 'fn_save_website_nav_item_translation', {
          p_item_id: savedId,
          p_locale: locale,
          p_title: t.title.trim(),
          p_description: t.description.trim() || null,
          p_body_html: input.kind === 'page' ? t.body_html : null,
          p_file_path: input.kind === 'document' ? t.file_path : null,
          p_file_name: input.kind === 'document' ? t.file_name : null,
          p_published: t.published,
        })
      : existed
        ? await callRpc(supabase, 'fn_delete_website_nav_item_translation', { p_item_id: savedId, p_locale: locale })
        : { error: null };
    if (result.error) {
      translationError = `Saved, but the ${localeLabels[locale].english} translation wasn't: ${result.error}`;
      // Keep the old translation PDF: the translation row may still point at it.
      filePathsOf(previous).forEach((p) => keptFiles.add(p));
      break;
    }
    if (t?.title.trim() && input.kind === 'document' && t.file_path) keptFiles.add(t.file_path);
  }

  await removeFiles(
    supabase,
    filePathsOf(previous).filter((p) => !keptFiles.has(p)),
  );

  revalidateNav();
  return { error: translationError, id: savedId };
}

export async function deleteNavItem(id: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: files, error } = await callRpc<string[]>(supabase, 'fn_delete_website_nav_item', { p_id: id });
  if (error) return { error };
  await removeFiles(supabase, files ?? []);
  revalidateNav();
  return { error: null };
}

// ids: one parent's children, in their new order.
export async function reorderNavItems(ids: number[]): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await callRpc(supabase, 'fn_reorder_website_nav_items', { p_ids: ids });
  if (error) return { error };
  revalidateNav();
  return { error: null };
}

// Removes a PDF the editor uploaded but that was never saved (replaced
// before saving, or the edit was discarded). Refuses paths any item still
// uses, so it can't be used to break a published document.
export async function discardUnsavedUpload(path: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: items, error } = await callRpc<AdminNavItem[]>(supabase, 'fn_get_website_nav_items');
  if (error) return { error };
  if (items?.some((item) => filePathsOf(item).includes(path))) return { error: null };
  await removeFiles(supabase, [path]);
  return { error: null };
}
