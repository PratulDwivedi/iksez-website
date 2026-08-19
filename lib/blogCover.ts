// website_blogs.cover_url stores one of three shapes: a bare filename
// uploaded to the `blog-covers` Supabase Storage bucket (e.g.
// "abc123.png" — see CoverImageField.tsx), a local static asset path under
// public/blog (e.g. "/blog/zero-downtime-migration.svg"), or a full
// absolute URL (legacy rows saved before this resolver existed). Only the
// first form needs resolving; the other two are already usable as-is.
//
// Centralizing the bucket prefix here (driven by
// NEXT_PUBLIC_BLOG_COVER_BASE_URL) means a storage migration only ever
// requires changing that one env var, never every stored cover_url.
export function resolveCoverUrl(coverUrl: string): string {
  if (!coverUrl) return coverUrl;
  if (/^https?:\/\//i.test(coverUrl) || coverUrl.startsWith('/')) return coverUrl;
  return `${process.env.NEXT_PUBLIC_BLOG_COVER_BASE_URL ?? ''}${coverUrl}`;
}
