import type { MetadataRoute } from "next";
import { getPublishedBlogList } from "@/lib/publicBlogs";
import { getPublishedNewsEventList, newsEventSlug } from "@/lib/publicNewsEvents";
import { SITE_URL } from "@/lib/siteUrl";

const FIRST_PARTY_API_KEY = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;

export const dynamic = "force-dynamic";

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
  const [blogResult, newsResult] = await Promise.all([
    getPublishedBlogList({ apiKey: FIRST_PARTY_API_KEY, pageSize: 1000 }),
    getPublishedNewsEventList({ apiKey: FIRST_PARTY_API_KEY, pageSize: 1000 }),
  ]);

  const staticEntries = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries = blogResult.data.map((post) => ({
    url: `${SITE_URL}/blog/${post.name}/`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const newsEntries = newsResult.data.map((item) => ({
    url: `${SITE_URL}/news-and-events/${newsEventSlug(item.title)}/`,
    lastModified: new Date(item.updated_at || item.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries, ...newsEntries];
}