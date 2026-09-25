import { localizePath, type Locale } from '@/lib/i18n/config';

// Shared by the public site (header, CMS pages) and the admin navigation
// editor, so nothing here may import server-only code.

export type NavKind = 'link' | 'page' | 'document';

// Exactly what fn_get_website_nav returns per row (see
// supabase/migrations/*_fn_website_nav_items.sql): the published tree as a
// flat list, already resolved to one locale with per-field English fallback.
export interface NavRow {
  id: number;
  parent_id: number | null;
  slug: string;
  // Ancestor slugs joined with "/" — the page's URL without slashes around it.
  path: string;
  depth: number;
  kind: NavKind;
  title: string;
  // Optional subtitle: the page hero's subtitle, and the text under the item
  // where its parent page lists it.
  description: string | null;
  href: string | null;
  body_html: string | null;
  file_path: string | null;
  file_name: string | null;
  open_in_new_tab: boolean;
  show_in_menu: boolean;
  sort_order: number;
  updated_at: string;
  // Only meaningful for non-English requests: the language title/body are
  // actually in, whether the item has no translation at all, and whether the
  // PDF is the English one.
  locale: string;
  is_fallback: boolean;
  file_is_fallback: boolean;
}

export interface NavNode extends NavRow {
  children: NavNode[];
}

export const DOCUMENTS_BUCKET = 'website-documents';

// Public URL of a PDF stored in the website-documents bucket.
export function documentFileUrl(filePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${DOCUMENTS_BUCKET}/${filePath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

export function buildNavTree(rows: NavRow[]): NavNode[] {
  const nodes = new Map<number, NavNode>(rows.map((row) => [row.id, { ...row, children: [] }]));
  const roots: NavNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parent_id === null ? undefined : nodes.get(node.parent_id);
    if (parent) parent.children.push(node);
    else if (node.parent_id === null) roots.push(node);
  }
  const bySortOrder = (a: NavNode, b: NavNode) => a.sort_order - b.sort_order || a.id - b.id;
  for (const node of nodes.values()) node.children.sort(bySortOrder);
  return roots.sort(bySortOrder);
}

export function isExternalHref(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
}

// Where clicking an item goes. Pages and documents live at their tree path
// (a document's path redirects to its PDF, so shared links stay on this
// domain and pick the PDF for the visitor's language); links use their own
// href, localized when it's an internal route.
export function navItemHref(item: Pick<NavRow, 'kind' | 'path' | 'href'>, locale: Locale): string {
  if (item.kind === 'link') {
    const href = item.href ?? '/';
    return isExternalHref(href) ? href : localizePath(href, locale);
  }
  return localizePath(`/${item.path}/`, locale);
}

// A link/document that must be a plain <a> (new tab, external, or a
// redirect to a PDF) rather than a client-side <Link> navigation.
export function navItemNeedsAnchor(item: Pick<NavRow, 'kind' | 'href' | 'open_in_new_tab'>): boolean {
  return item.open_in_new_tab || item.kind === 'document' || (item.kind === 'link' && isExternalHref(item.href ?? ''));
}

// First path segments that already belong to coded routes under
// app/(marketing)/[lang]/. A top-level page or document with one of these
// slugs would never be reached (the coded route wins), so the admin rejects
// them.
export const RESERVED_TOP_LEVEL_SLUGS = [
  'about-us',
  'agropark',
  'benefits',
  'blog',
  'board-of-directors',
  'contact-us',
  'existing-units',
  'gallery',
  'industrial',
  'invitation-for-investors',
  'master-plan',
  'news-and-events',
  'privacy-policy',
  'strategic',
  'tax',
  'zone',
  'admin',
  'api',
  'en',
  'te',
] as const;

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
