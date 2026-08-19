// Display-only formatting for BlogRow (see lib/publicBlogs.ts) — kept out
// of the data-fetching layer so getPublishedBlogList/getPublishedBlogBySlug
// return the DB row untouched, exactly as fn_get_website_blogs produced it.
export function formatBlogDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function blogReadTime(minutes: number) {
  return `${minutes} min read`;
}
