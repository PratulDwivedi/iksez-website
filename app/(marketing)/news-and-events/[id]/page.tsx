import type { Metadata } from "next";
import { ArrowLeft, Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import { PostBody } from "@/components/blog/PostBody";
import {
  getPublishedNewsEventById,
  getPublishedNewsEventBySlug,
  getPublishedNewsEventList,
  newsEventSlug,
} from "@/lib/publicNewsEvents";

const FIRST_PARTY_API_KEY = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatEventDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

export async function generateStaticParams() {
  const { data } = await getPublishedNewsEventList({ apiKey: FIRST_PARTY_API_KEY, pageSize: 1000 });
  return data.map((item) => ({ id: newsEventSlug(item.title) }));
}

async function getNewsEventByRouteValue(value: string) {
  return /^\d+$/.test(value)
    ? getPublishedNewsEventById(Number(value), FIRST_PARTY_API_KEY)
    : getPublishedNewsEventBySlug(value, FIRST_PARTY_API_KEY);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getNewsEventByRouteValue(id);

  if (!item) return { title: "News and Event Not Found | IFFCO Kisan SEZ" };

  const description = item.body.find((block) => block.type === "paragraph")?.text;
  const canonicalPath = `/news-and-events/${newsEventSlug(item.title)}/`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iksezwebsite.vercel.app";
  const imageUrl = new URL(item.gallery[0]?.url ?? "/images/media-banner.webp", siteUrl).toString();

  return {
    title: `${item.title} | IFFCO Kisan SEZ`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: item.title,
      description,
      url: canonicalPath,
      type: "article",
      images: [{ url: imageUrl, alt: item.gallery[0]?.caption || item.title }],
    },
  };
}

export default async function NewsEventPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getNewsEventByRouteValue(id);
  if (!item) notFound();

  const eventDate = formatEventDate(item.event_date);

  return (
    <>
      <PageHero title="News and Events" subtitle={item.title} banner="/images/media-banner.webp" />

      <section className="section">
        <div className="container container--narrow">
          <Link href="/news-and-events/" className="blog-post__back">
            <ArrowLeft /> Back to News and Events
          </Link>

          <div className="blog-post__head">
            <h1 style={{ fontSize: "var(--fs-3xl)" }}>{item.title}</h1>
            {eventDate && (
              <div className="blog-post__meta">
                <span className="blog-post__readtime">
                  <Calendar /> {eventDate}
                </span>
              </div>
            )}
          </div>

          {item.gallery[0] && (
            <div className="blog-post__cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.gallery[0].url} alt={item.gallery[0].caption || item.title} />
            </div>
          )}

          <PostBody blocks={item.body} />

          {item.gallery.length > 1 && (
            <div className="news-detail__gallery">
              <h2>More Photos</h2>
              <div className="news-item__gallery">
                {item.gallery.slice(1).map((image) => (
                  <a
                    className="gallery__item"
                    key={image.url}
                    href={image.url}
                    data-lightbox=""
                    data-caption={image.caption}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt={image.caption || item.title} loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-8" style={{ marginTop: "var(--sp-9)" }}>
        <CtaBand />
      </div>
    </>
  );
}