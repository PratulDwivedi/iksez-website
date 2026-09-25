import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { BlogRow } from '@/lib/publicBlogs';
import { formatBlogDate, blogReadTime } from '@/lib/blogDisplay';
import { format } from '@/lib/i18n/format';
import { localizePath, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/getDictionary';

type BlogCardProps = {
  post: BlogRow;
  lang: Locale;
  labels: Dictionary['blog'];
};

export function BlogCard({ post, lang, labels }: BlogCardProps) {
  const href = localizePath(`/blog/${post.name}/`, lang);

  return (
    // An untranslated post shown on a non-English page keeps lang="en" on its
    // own text, so screen readers and hyphenation treat it as English.
    <article className="media-card" lang={post.is_fallback ? 'en' : undefined}>
      <div className="media-card__figure blog-card__figure">
        <span className="blog-card__cat">{post.category}</span>
        <Image
          src={post.cover_url}
          alt={post.cover_alt || post.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className="media-card__body">
        <div className="blog-card__meta" lang={lang}>
          <span>
            <Calendar />
            {formatBlogDate(post.published_at, lang)}
          </span>
          <span>
            <Clock />
            {blogReadTime(post.read_minutes, labels.readTime)}
          </span>
        </div>

        <h3 className="blog-card__title">
          <Link href={href}>{post.title}</Link>
        </h3>

        <p className="blog-card__excerpt">{post.excerpt}</p>

        <div className="blog-card__foot" lang={lang}>
          <span className="blog-card__author">{format(labels.byAuthor, { author: post.author_name })}</span>
          <Link href={href} className="blog-card__readmore">
            {labels.readArticle} <ArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
}
