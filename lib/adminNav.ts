import type { TranslationLocale } from '@/lib/blogTranslations';
import type { NavKind } from '@/lib/navTree';

// Admin-side shapes for the navigation editor. AdminNavItem is exactly what
// fn_get_website_nav_items returns per row (see
// supabase/migrations/*_fn_website_nav_items.sql); English is the item
// itself, so it never appears in translations.

export interface AdminNavTranslation {
  locale: string;
  title: string;
  description: string | null;
  body_html: string | null;
  file_path: string | null;
  file_name: string | null;
  published: boolean;
  updated_at: string;
}

export interface AdminNavItem {
  id: number;
  parent_id: number | null;
  slug: string;
  kind: NavKind;
  title: string;
  description: string | null;
  href: string | null;
  body_html: string | null;
  file_path: string | null;
  file_name: string | null;
  open_in_new_tab: boolean;
  show_in_menu: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  translations: AdminNavTranslation[];
}

export interface NavTranslationInput {
  locale: TranslationLocale;
  title: string;
  description: string;
  body_html: string;
  file_path: string | null;
  file_name: string | null;
  published: boolean;
}

// What the editor submits to saveNavItem: the item plus every translation
// tab. A translation tab left with an empty title is removed on save.
export interface NavItemInput {
  id: number | null;
  parent_id: number | null;
  slug: string;
  kind: NavKind;
  title: string;
  description: string;
  href: string;
  body_html: string;
  file_path: string | null;
  file_name: string | null;
  open_in_new_tab: boolean;
  show_in_menu: boolean;
  published: boolean;
  translations: NavTranslationInput[];
}
