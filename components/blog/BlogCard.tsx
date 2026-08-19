import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { BlogRow } from '@/lib/publicBlogs';
import { formatBlogDate, blogReadTime } from '@/lib/blogDisplay';

export function BlogCard({ post }: { post: BlogRow }) {
  const href = `/blog/${post.name}/`;

  return (
    <article className="media-card">
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
        <div className="blog-card__meta">
          <span>
            <Calendar />
            {formatBlogDate(post.published_at)}
          </span>
          <span>
            <Clock />
            {blogReadTime(post.read_minutes)}
          </span>
        </div>

        <h4 className="blog-card__title">
          <Link href={href}>{post.title}</Link>
        </h4>

        <p className="blog-card__excerpt">{post.excerpt}</p>

        <div className="blog-card__foot">
          <span className="blog-card__author">By {post.author_name}</span>
          <Link href={href} className="blog-card__readmore">
            Read Article <ArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
}
