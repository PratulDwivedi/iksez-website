import Link from "next/link";
import type { Metadata } from "next";
import CtaBand from "@/components/CtaBand";
import FeatureCard from "@/components/FeatureCard";
import { chairman, directors, managingDirector } from "@/lib/leadership";
import { getPublishedNewsEventList, newsEventSlug, sortNewsEventsByLatest } from "@/lib/publicNewsEvents";

export const metadata: Metadata = {
  title: "IFFCO Kisan SEZ | Agribusiness Special Economic Zone & Integrated Agropark",
  description:
    "IFFCO Kisan SEZ is being setup as an Agribusiness Special Economic Zone based on the concept of Integrated Agropark, with customs duty, income tax and sales tax concessions provided by the Government of India.",
};

export const revalidate = 300;

const FIRST_PARTY_API_KEY = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;

const HERO_IMAGE = "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1800&q=85";

function formatNewsDate(isoDate: string | null): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

export default async function Home() {
  const { data: newsItems, is_success: newsLoaded } = await getPublishedNewsEventList({
    apiKey: FIRST_PARTY_API_KEY,
    pageSize: 3,
  });

  return (
    <>
      {/* Preloaded as the likely LCP element — React 19 hoists this into
          <head>, so the browser fetches it before it even parses the CSS
          that references it as a background-image. */}
      <link rel="preload" as="image" href={HERO_IMAGE} fetchPriority="high" />

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container">
          <div className="hero__grid">
            <div className="hero__content">
              <span className="hero__eyebrow">
                <span className="dot"></span> Notified Multi Product SEZ
              </span>
              <h1>An Agribusiness SEZ , Integrated Agropark</h1>
              <p className="hero__text">
                IFFCO Kisan SEZ is being set up as an Agribusiness Special Economic Zone based on
                and sales tax concessions provided by the Government of India to promote economic
                activity.
              </p>
              <div className="hero__actions">
                <Link className="btn btn--green btn--lg" href="/invitation-for-investors/">
                  Business Opportunities
                </Link>
                <Link className="btn btn--outline btn--lg" href="/about-us/">
                  About IKSEZ
                </Link>
              </div>
            </div>

            <aside className="hero__updates" aria-label="Latest news and events">
              <div className="hero__updates-head">
                <div>
                  <span className="eyebrow">Latest updates</span>
                  <h2>News &amp; Events</h2>
                </div>
                <Link className="link-arrow" href="/news-and-events/">View all</Link>
              </div>
              {newsLoaded && newsItems.length > 0 ? (
                <div className="hero__update-list">
                  {sortNewsEventsByLatest(newsItems).slice(0, 3).map((item) => (
                    <Link className="hero__update" href={`/news-and-events/${newsEventSlug(item.title)}/`} key={item.id}>
                      {item.gallery[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.gallery[0].url} alt="" loading="lazy" />
                      ) : (
                        <span className="hero__update-thumb" aria-hidden="true" />
                      )}
                      <span>
                        <strong>{item.title}</strong>
                        <small>{formatNewsDate(item.event_date)}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="hero__updates-empty">No news or events posted yet.</p>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ================= ABOUT + STATS ================= */}
      <section id="about" className="home-about">
        <div className="container">
          <div className="home-about__grid">
            <div className="home-about__copy">
              <h2>About IFFCO Kisan SEZ</h2>
              <p>IFFCO Kisan SEZ is a premier integrated agro-industrial park designed to foster value addition, employment and sustainable growth in the agriculture sector. With world-class infrastructure.</p>
              <Link className="home-reference__btn home-reference__btn--green" href="/about-us/">Read More →</Link>
            </div>
            <div className="home-stats">
              <div><span className="home-stat__icon">♧</span><strong>1,900</strong><small>Acres of Multiproduct<br />Special Economic Zone</small></div>
              <div><span className="home-stat__icon">⌁</span><strong>877</strong><small>Acres of Domestic Tariff<br />Area (DTA)</small></div>
              <div><span className="home-stat__icon">▥</span><strong>8 km</strong><small>Frontage on National<br />Highway 16</small></div>
              <div><span className="home-stat__icon">⌂</span><strong>220 kV</strong><small>Power Station for<br />power supply</small></div>
            </div>
          </div>
        </div>
      </section>

      <section id="zones" className="home-reference-section home-reference-section--alt">
        <div className="container">
          <div className="home-section-head">
            <div>
              <div className="home-reference__kicker">Our Zones</div>
              <h2>Two strategic zones, one integrated vision</h2>
            </div>
          </div>
          <div className="home-zone-grid">
            <article className="home-zone-card">
              <div className="home-zone-card__image home-zone-card__image--sez" />
              <div className="home-zone-card__body">
                <h3>SEZ</h3>
                <div className="home-zone-card__sub">Special Economic Zone</div>
                <p>A dedicated zone for export-oriented units with world-class infrastructure, customs benefits and seamless logistics support.</p>
                <Link href="/zone/sez/">Explore SEZ →</Link>
              </div>
            </article>
            <article className="home-zone-card">
              <div className="home-zone-card__image home-zone-card__image--dtz" />
              <div className="home-zone-card__body">
                <h3>DTZ</h3>
                <div className="home-zone-card__sub">Domestic Tariff Zone</div>
                <p>Designed for domestic market industries with flexible operations and a conducive business environment.</p>
                <Link href="/zone/dtz/">Explore DTZ →</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      

      <section className="home-reference-section home-reference-section--alt home-features">
        <div className="container">
          <div className="home-section-head">
            <div>
              <div className="home-reference__kicker">Major Features</div>
              <h2>Why investors choose IKSEZ</h2>
            </div>
          </div>
          <div className="home-feature-grid">
            <FeatureCard title="Multiproduct SEZ" icon={<span>▥</span>}>A Multiproduct Special Economic Zone (SEZ) spanning approximately 1,900 acres.</FeatureCard>
            <FeatureCard title="Domestic Tariff Area" icon={<span>⌂</span>}>A Domestic Tariff Area (DTA) covering about 877 acres which is designated for initiatives focused on domestic Indian market.</FeatureCard>
            <FeatureCard title="Multimodal Connectivity" icon={<span>⌁</span>}>The location is well connected by Road, Rail, Air and Sea.</FeatureCard>
            <FeatureCard title="NH 16 Frontage" icon={<span>⌖</span>}>The site is on NH 16 with 8 km frontage and adjacent to a trunk rail link.</FeatureCard>
            <FeatureCard title="Industrial Corridor" icon={<span>◇</span>}>The site falls in the Visakhapatnam-Chennai industrial corridor being actively developed by the state government.</FeatureCard>
            <FeatureCard title="Ready Infrastructure" icon={<span>ϟ</span>}>The site is equipped with the major infrastructural facilities with ready availability of water, power, office space and security.</FeatureCard>
            <FeatureCard title="Skilled Manpower" icon={<span>♧</span>}>Ready availability of skilled manpower.</FeatureCard>
            <FeatureCard title="Explore the full list of benefits" className="card--dark" actions={<Link className="btn btn--green btn--sm" href="/benefits/">See All Benefits</Link>}>Tax concessions under the SEZ Act plus strategic advantages across power, water, connectivity and manpower.</FeatureCard>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
