import Link from "next/link";
import type { Metadata } from "next";
import HeroSlider from "@/components/HeroSlider";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "IFFCO Kisan SEZ | Agribusiness Special Economic Zone & Integrated Agropark",
  description:
    "IFFCO Kisan SEZ is being setup as an Agribusiness Special Economic Zone based on the concept of Integrated Agropark, with customs duty, income tax and sales tax concessions provided by the Government of India.",
};

const HERO_IMAGES = [
  "/images/1.webp",
  "/images/2.webp",
  "/images/3.webp",
  "/images/4.webp",
  "/images/5.webp",
  "/images/6.webp",
];

export default function Home() {
  return (
    <>
      {/* Preloaded as the likely LCP element — React 19 hoists this into
          <head>, so the browser fetches it before it even parses the CSS
          that references it as a background-image. */}
      <link rel="preload" as="image" href={HERO_IMAGES[0]} fetchPriority="high" />

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container">
          <div className="hero__grid">
            <div className="hero__content">
              <span className="hero__eyebrow">
                <span className="dot"></span> Notified Multi Product SEZ
              </span>
              <h1>
                An Agribusiness SEZ , <span className="accent">Integrated Agropark</span>
              </h1>
              <p className="hero__text">
                IFFCO Kisan SEZ is being setup as an Agribusiness Special Economic Zone based on
                the concept of Integrated Agropark. It comes with various customs duty, income tax
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

            <HeroSlider images={HERO_IMAGES} />
          </div>
        </div>
      </section>

      {/* ================= KEY NUMBERS ================= */}
      <section className="section section--tight">
        <div className="container">
          <div className="stats" data-reveal="">
            <div className="stat">
              <div className="stat__value">
                <span data-count="1900" data-suffix="">
                  1,900
                </span>
              </div>
              <p className="stat__label">Acres of Multiproduct Special Economic Zone</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="877">877</span>
              </div>
              <p className="stat__label">Acres of Domestic Tariff Area (DTA)</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="8">8</span> km
              </div>
              <p className="stat__label">Frontage on National Highway&nbsp;16</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="220">220</span> kV
              </div>
              <p className="stat__label">Power Station for power supply</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div className="split__figure" data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/img1.webp" alt="IFFCO Kisan SEZ" loading="lazy" />
            </div>
            <div data-reveal="">
              <div className="section-head">
                <span className="eyebrow">About</span>
                <h2>A unique initiative of IFFCO</h2>
              </div>
              <p className="lead">
                IFFCO Kisan SEZ is being setup as an Agribusiness Special Economic Zone based on
                the concept of Integrated Agropark. It comes with various customs duty, income tax
                and sales tax concessions provided by the Government of India to promote economic
                activity.
              </p>
              <div className="mt-6">
                <Link className="btn btn--outline" href="/about-us/">
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAJOR FEATURES ================= */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--center" data-reveal="">
            <span className="eyebrow">Major Features</span>
            <h2>Why investors choose IKSEZ</h2>
          </div>

          <div className="grid grid--3">
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h4>Multiproduct SEZ</h4>
              <p>A Multiproduct Special Economic Zone (SEZ) spanning approximately 1,900 acres.</p>
            </article>

            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
                </svg>
              </div>
              <h4>Domestic Tariff Area</h4>
              <p>
                A Domestic Tariff Area (DTA) covering about 877 acres which is designated for
                initiatives focused on domestic Indian market.
              </p>
            </article>

            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
                </svg>
              </div>
              <h4>Multimodal Connectivity</h4>
              <p>The location is well connected by Road, Rail, Air and Sea.</p>
            </article>

            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M4 19h16M6 19V9l6-5 6 5v10" />
                  <path d="M10 19v-5h4v5" />
                </svg>
              </div>
              <h4>NH 16 Frontage</h4>
              <p>The site is on NH 16 with 8 km frontage and adjacent to a trunk rail link.</p>
            </article>

            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2 3 7v6c0 5 3.8 8.5 9 9 5.2-.5 9-4 9-9V7l-9-5z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h4>Industrial Corridor</h4>
              <p>
                The site falls in the Visakhapatnam-Chennai industrial corridor being actively
                developed by the state government.
              </p>
            </article>

            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
              </div>
              <h4>Ready Infrastructure</h4>
              <p>
                The site is equipped with the major infrastructural facilities with ready
                availability of water, power, office space and security.
              </p>
            </article>

            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9.5" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
                </svg>
              </div>
              <h4>Skilled Manpower</h4>
              <p>Ready availability of skilled manpower.</p>
            </article>

            <article className="card card--dark" data-reveal="" style={{ justifyContent: "center" }}>
              <h4>Explore the full list of benefits</h4>
              <p>
                Tax concessions under the SEZ Act plus strategic advantages across power, water,
                connectivity and manpower.
              </p>
              <div className="card__foot">
                <Link className="btn btn--green btn--sm" href="/tax/">
                  Read More
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ================= OPPORTUNITIES TEASER ================= */}
      <section className="section">
        <div className="container">
          <div className="split split--reverse">
            <div className="split__figure" data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/agropark-image.webp"
                alt="The Agropark concept at IFFCO Kisan SEZ"
                loading="lazy"
              />
            </div>
            <div data-reveal="">
              <div className="section-head">
                <span className="eyebrow">The Agropark Concept</span>
                <h2>Demand driven integration of agricultural activity</h2>
              </div>
              <p>
                An Agropark is a systems innovation of metropolitan agro production, processing
                and logistics. As part of an Intelligent Agro-logistic Network, it enables a
                demand driven combination and integration of various agricultural activities.
              </p>
              <div className="chip-row mt-6">
                <span className="chip chip--green">Processed Fruits &amp; Vegetables</span>
                <span className="chip chip--green">Aquaculture</span>
                <span className="chip chip--green">Dairy Processing</span>
                <span className="chip chip--green">Renewable Energy</span>
                <span className="chip chip--green">Warehouses &amp; Logistics</span>
              </div>
              <div className="mt-6">
                <Link className="link-arrow" href="/agropark/">
                  Explore the Agropark
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXISTING UNITS ================= */}
      <section className="section section--soft">
        <div className="container">
          <div className="section-head section-head--center" data-reveal="">
            <span className="eyebrow">Existing units</span>
            <h2>Already operating at IKSEZ</h2>
            <p>Many other companies of National repute are also expected to set up their units very soon.</p>
          </div>
          <div className="grid grid--4">
            <div className="card card--flat text-center" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>
                Siemens Gamesa Renewable Energy Pvt Ltd
              </h4>
            </div>
            <div className="card card--flat text-center" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>ADJ</h4>
            </div>
            <div className="card card--flat text-center" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>APTRANSCO</h4>
            </div>
            <div className="card card--flat text-center" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>
                HCCB <span className="muted" style={{ fontWeight: 500 }}>(coming up)</span>
              </h4>
            </div>
          </div>
          <div className="text-center mt-8" data-reveal="">
            <Link className="btn btn--outline" href="/existing-units/">
              View existing units
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
