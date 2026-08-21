import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { newsEventSlug, type NewsEventRow } from "@/lib/publicNewsEvents";

function formatEventDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function getExcerpt(item: NewsEventRow): string {
  const firstText = item.body.find((block) => block.type === "paragraph")?.text;
  if (!firstText) return "Read the latest news and event update from IFFCO Kisan SEZ.";
  return firstText.length > 150 ? `${firstText.slice(0, 147).trimEnd()}...` : firstText;
}

export function NewsEventCard({ item }: { item: NewsEventRow }) {
  const cover = item.gallery[0];
  const href = `/news-and-events/${newsEventSlug(item.title)}/`;

  return (
    <article className="media-card" data-reveal="">
      <div className="media-card__figure blog-card__figure">
        <span className="blog-card__cat">News and Events</span>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.url} alt={cover.caption || item.title} loading="lazy" />
        ) : (
          <div className="media-card__placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="media-card__body">
        {item.event_date && (
          <div className="blog-card__meta">
            <span>
              <Calendar />
              {formatEventDate(item.event_date)}
            </span>
          </div>
        )}
        <h3 className="blog-card__title">
          <Link href={href}>{item.title}</Link>
        </h3>
        <p className="blog-card__excerpt">{getExcerpt(item)}</p>
        <div className="blog-card__foot">
          <span className="blog-card__author">
            {item.gallery.length} {item.gallery.length === 1 ? "image" : "images"}
          </span>
          <Link href={href} className="blog-card__readmore">
            <span className="sr-only">Read more about {item.title}</span>
            <span aria-hidden="true">Read More</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}