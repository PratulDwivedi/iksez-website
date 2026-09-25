import type { MetadataRoute } from "next";
import { getPublishedBlogList } from "@/lib/publicBlogs";
import { getPublishedNewsEventList, newsEventSlug } from "@/lib/publicNewsEvents";
import { SITE_URL } from "@/lib/siteUrl";
import { getPublishedNav } from "@/lib/publicNav";
import type { NavNode } from "@/lib/navTree";
import { defaultLocale, indexedLocales, localeTags, localizePath, type Locale } from "@/lib/i18n/config";

const FIRST_PARTY_API_KEY = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;

export const dynamic = "force-dynamic";

// A sitemap entry keyed by locale-neutral path, before it's expanded into
// one URL per locale it exists in.
type SitemapSource = Omit<MetadataRoute.Sitemap[number], "url" | "alternates"> & {
  path: string;
  locales?: readonly Locale[];
};

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/about-us/", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/agropark/", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/benefits/", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/board-of-directors/", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/contact-us/", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/existing-units/", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/gallery/", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/industrial/", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/invitation-for-investors/", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/master-plan/", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/news-and-events/", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/privacy-policy/", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/strategic/", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/tax/", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/blog/", priority: 0.8, changeFrequency: "weekly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const translatedLocales = indexedLocales.filter((l) => l !== defaultLocale);
  const [blogResult, newsResult, nav, ...translatedBlogResults] = await Promise.all([
    getPublishedBlogList({ apiKey: FIRST_PARTY_API_KEY, pageSize: 1000 }),
    getPublishedNewsEventList({ apiKey: FIRST_PARTY_API_KEY, pageSize: 1000 }),
    getPublishedNav(defaultLocale),
    ...translatedLocales.map((locale) => getPublishedBlogList({ apiKey: FIRST_PARTY_API_KEY, pageSize: 1000, locale })),
  ]);

  // A post only gets a URL in a non-English locale if it has a published
  // translation there — an English fallback page is canonical to the English
  // URL (see blog/[slug]/page.tsx), so it doesn't belong in the sitemap.
  const translatedSlugs = new Map<Locale, Set<string>>(
    translatedLocales.map((locale, i) => [
      locale,
      new Set(translatedBlogResults[i].data.filter((post) => !post.is_fallback).map((post) => post.name)),
    ]),
  );

  // Locale-neutral paths; expanded to one URL per indexed locale below.
  const staticEntries = staticRoutes.map((route) => ({
    path: route.path,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries = blogResult.data.map((post) => ({
    path: `/blog/${post.name}/`,
    locales: indexedLocales.filter((l) => l === defaultLocale || translatedSlugs.get(l)?.has(post.name)),
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const newsEntries = newsResult.data.map((item) => ({
    path: `/news-and-events/${newsEventSlug(item.title)}/`,
    lastModified: new Date(item.updated_at || item.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Admin-managed CMS pages (website_nav_items of kind "page"). Documents
  // are PDFs behind a redirect and links point at routes listed elsewhere.
  const cmsPages: NavNode[] = [];
  const collectPages = (nodes: NavNode[]) => {
    for (const node of nodes) {
      if (node.kind === "page") cmsPages.push(node);
      collectPages(node.children);
    }
  };
  collectPages(nav?.tree ?? []);
  const cmsEntries = cmsPages.map((node) => ({
    path: `/${node.path}/`,
    lastModified: new Date(node.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Only locales cleared for indexing (see indexedLocales) are listed, each
  // with hreflang alternates pointing at its other-language versions.
  const absoluteUrl = (path: string) => `${SITE_URL}${path}`;
  // Entries without their own `locales` exist in every indexed locale.
  const entries: SitemapSource[] = [
    ...staticEntries,
    ...blogEntries,
    ...newsEntries,
    ...cmsEntries,
  ];
  return entries.flatMap(({ path, locales = indexedLocales, ...entry }) =>
    locales.map((locale) => ({
      ...entry,
      url: absoluteUrl(localizePath(path, locale)),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [localeTags[l], absoluteUrl(localizePath(path, l))])),
      },
    })),
  );
}