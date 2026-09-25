import { format } from '@/lib/i18n/format';
import { localeTags, type Locale } from '@/lib/i18n/config';

// Display-only formatting for BlogRow (see lib/publicBlogs.ts) — kept out
// of the data-fetching layer so getPublishedBlogList/getPublishedBlogBySlug
// return the DB row untouched, exactly as fn_get_website_blogs produced it.
//
// English keeps its original en-US "September 25, 2026" format; other
// locales use their own month names and ordering (te-IN: "25 సెప్టెంబర్ 2026").
export function formatBlogDate(iso: string, locale: Locale = 'en') {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : localeTags[locale], {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// template is the dictionary's blog.readTime string ("{minutes} min read").
export function blogReadTime(minutes: number, template = '{minutes} min read') {
  return format(template, { minutes });
}
