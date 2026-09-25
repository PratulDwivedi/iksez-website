import type { BlogBlock } from '@/lib/blogBody';
import type { FaqItem } from '@/lib/blogFaq';
import { defaultLocale, locales, type Locale } from '@/lib/i18n/config';

// Admin-side shape of a website_blog_translations row, exactly as
// fn_get_website_blog_translations returns it (see
// supabase/migrations/*_fn_website_blog_translation_crud.sql). English is
// the post itself, so it never appears here.
export interface BlogTranslation {
  id: number;
  blog_id: number;
  locale: string;
  title: string;
  excerpt: string;
  cover_alt: string | null;
  body: BlogBlock[];
  data: { faqs?: FaqItem[] } | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// English is the post itself (defaultLocale in lib/i18n/config.ts).
export type TranslationLocale = Exclude<Locale, 'en'>;

// Every site locale except English gets a tab in the admin blog editor.
export const translationLocales = locales.filter(
  (l): l is TranslationLocale => l !== defaultLocale,
);

// Form field name for one locale's copy of a field: ("te", "title") ->
// "tr_te_title". Shared by BlogForm (inputs) and saveBlogPost (reading them).
export function translationField(locale: TranslationLocale, field: string) {
  return `tr_${locale}_${field}`;
}
