import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import { PostBody } from "@/components/blog/PostBody";
import { getPublishedNewsEventList, type NewsEventRow } from "@/lib/publicNewsEvents";

export const metadata: Metadata = {
  title: "News and Events | IFFCO Kisan SEZ",
  description:
    "News and events from IFFCO Kisan SEZ — CSR medical camps, official visits and community initiatives at SPSR Nellore.",
};

// First-party call, same pattern as /blog (see that page.tsx's comment): an
// explicit x-api-key resolves fn_get_website_news_events to IFFCO Kisan
// SEZ's own tenant instead of requiring a third-party integrator's key.
const FIRST_PARTY_API_KEY = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;

// dd.mm.yyyy — matches this page's previous hardcoded date format exactly
// (e.g. "26.09.2024"), rather than switching to a locale-formatted date.
function formatEventDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function NewsItem({ item }: { item: NewsEventRow }) {
  return (
    <article className="news-item" data-reveal="">
      {item.event_date && <span className="news-item__date">{formatEventDate(item.event_date)}</span>}
      <h3>{item.title}</h3>
      <PostBody blocks={item.body} />
      {item.gallery.length > 0 && (
        <div className="news-item__gallery">
          {item.gallery.map((image) => (
            <a
              className="gallery__item"
              key={image.url}
              href={image.url}
              data-lightbox=""
              data-caption={image.caption}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.caption} loading="lazy" />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

export default async function NewsAndEvents() {
  const { data: items, is_success, message } = await getPublishedNewsEventList({
    apiKey: FIRST_PARTY_API_KEY,
    pageSize: 50,
  });

  return (
    <>
      <PageHero title="Media" subtitle="News and Events" banner="/images/media-banner.webp" />

      <section className="section section--tight">
        <div className="container">
          <div className="chip-row" data-reveal="">
            <Link className="btn btn--brand btn--sm" href="/news-and-events/">
              News and Events
            </Link>
            <Link className="btn btn--outline btn--sm" href="/gallery/">
              Image Gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container container--narrow">
          {!is_success ? (
            <p className="blog-error">{message}</p>
          ) : items.length === 0 ? (
            <p className="blog-empty">No news or events posted yet.</p>
          ) : (
            items.map((item) => <NewsItem key={item.id} item={item} />)
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
