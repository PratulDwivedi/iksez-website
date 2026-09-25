import { localizePath, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/getDictionary';
import { navItemHref, navItemNeedsAnchor, type NavNode } from '@/lib/navTree';

// One header menu entry, fully resolved on the server (label in the page's
// language, localized href) so the client Header just renders it.
export interface HeaderNavItem {
  key: string;
  label: string;
  href: string;
  // Render as a plain <a> (external, new tab, or a PDF redirect) instead of
  // a client-side <Link>.
  anchor: boolean;
  newTab: boolean;
  // CMS pages stay highlighted on any URL beneath them
  // (/reports-policies/annual-reports/2024-25/ keeps Reports & Policies lit).
  matchPrefix: boolean;
  children?: HeaderNavItem[];
}

// Deepest header level (0-based): the bar, its dropdown, and one flyout
// beside a dropdown entry. Deeper items, and anything with show_in_menu off,
// are reached from their parent page's listing instead.
export const HEADER_MAX_DEPTH = 2;

export function headerNavFromTree(tree: NavNode[], locale: Locale): HeaderNavItem[] {
  const toItem = (node: NavNode, depth: number): HeaderNavItem => {
    const children =
      depth < HEADER_MAX_DEPTH ? node.children.filter((c) => c.show_in_menu).map((c) => toItem(c, depth + 1)) : [];
    return {
      key: String(node.id),
      label: node.title,
      href: navItemHref(node, locale),
      anchor: navItemNeedsAnchor(node),
      newTab: node.open_in_new_tab,
      matchPrefix: node.kind === 'page',
      children: children.length > 0 ? children : undefined,
    };
  };
  return tree.filter((node) => node.show_in_menu).map((node) => toItem(node, 0));
}

type NavLabelKey = keyof Dictionary['header']['nav'];

// The menu the site shipped with before the header moved onto
// website_nav_items. Only used when the nav can't be loaded, so an outage of
// the nav RPC never leaves the site without a header menu.
const FALLBACK_NAV: { key: NavLabelKey; href: string; children?: { key: NavLabelKey; href: string }[] }[] = [
  { key: 'about', href: '/about-us/' },
  { key: 'leadership', href: '/board-of-directors/' },
  {
    key: 'zones',
    href: '/zone/sez/',
    children: [
      { key: 'sez', href: '/zone/sez/' },
      { key: 'dtz', href: '/zone/dtz/' },
    ],
  },
  {
    key: 'reportsPolicies',
    href: '/reports-policies/',
    children: [
      { key: 'annualReports', href: '/reports-policies/annual-reports/' },
      { key: 'csr', href: '/reports-policies/csr/' },
      { key: 'policies', href: '/reports-policies/policies/' },
      { key: 'compliances', href: '/reports-policies/compliances/' },
    ],
  },
  { key: 'newsMedia', href: '/news-and-events/' },
  { key: 'blogs', href: '/blog/' },
  { key: 'contact', href: '/contact-us/' },
];

export function fallbackHeaderNav(labels: Dictionary['header']['nav'], locale: Locale): HeaderNavItem[] {
  const toItem = (entry: { key: NavLabelKey; href: string }): HeaderNavItem => ({
    key: entry.key,
    label: labels[entry.key],
    href: localizePath(entry.href, locale),
    anchor: false,
    newTab: false,
    matchPrefix: false,
  });
  return FALLBACK_NAV.map((entry) => ({ ...toItem(entry), children: entry.children?.map(toItem) }));
}
