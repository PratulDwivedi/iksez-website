import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import { NewsEventCard } from "@/components/news/NewsEventCard";
import { getPublishedNewsEventList, sortNewsEventsByLatest } from "@/lib/publicNewsEvents";

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
export default async function NewsAndEvents() {
  const { data: items, is_success, message } = await getPublishedNewsEventList({
    apiKey: FIRST_PARTY_API_KEY,
    pageSize: 50,
  });

  return (
    <>
      <PageHero
        title="News and Events"
        subtitle="Latest updates and initiatives from IFFCO Kisan SEZ"
        banner="/images/media-banner.webp"
      />

      <section className="section">
        <div className="container">
          {!is_success ? (
            <p className="blog-error">{message}</p>
          ) : items.length === 0 ? (
            <p className="blog-empty">No news or events posted yet.</p>
          ) : (
            <div className="blog-grid">
              {sortNewsEventsByLatest(items).map((item) => <NewsEventCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
