import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Existing units | IFFCO Kisan SEZ",
  description:
    "Units operating at IFFCO Kisan SEZ including Siemens Gamesa Renewable Energy Pvt Ltd, ADJ and APTRANSCO, with HCCB coming up.",
};

export default function ExistingUnits() {
  return (
    <>
      <PageHero
        title="Existing units"
        subtitle="Many other companies of National repute are also expected to set up their units very soon."
        banner="/images/infrastructur-banner.png"
      />

      <section className="section">
        <div className="container">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Operating at IKSEZ</span>
            <h2>Companies on site</h2>
          </div>

          <div className="grid grid--4">
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v6M12 12l7 4M12 12l-7 4" />
                  <circle cx="12" cy="10" r="2.2" />
                </svg>
              </div>
              <h4 style={{ fontSize: "var(--fs-base)" }}>Siemens Gamesa Renewable Energy Pvt Ltd</h4>
            </article>
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="8" width="18" height="12" rx="2" />
                  <path d="M8 8V6a4 4 0 0 1 8 0v2" />
                </svg>
              </div>
              <h4 style={{ fontSize: "var(--fs-base)" }}>ADJ</h4>
            </article>
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
              </div>
              <h4 style={{ fontSize: "var(--fs-base)" }}>APTRANSCO</h4>
            </article>
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M8 2h8l-1 4H9L8 2zM7 6h10l1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L7 6z" />
                </svg>
              </div>
              <h4 style={{ fontSize: "var(--fs-base)" }}>
                HCCB <span className="muted" style={{ fontWeight: 500 }}>(coming up)</span>
              </h4>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">On site</span>
            <h2>From the units</h2>
          </div>

          <div className="grid grid--2">
            <article className="media-card" data-reveal="">
              <a
                className="media-card__figure"
                href="/images/existing-1.jpg"
                data-lightbox=""
                data-caption="Wind mill blade of Siemen’s Gamesa being transported"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/existing-1.jpg"
                  alt="Wind mill blade of Siemen’s Gamesa being transported"
                  loading="lazy"
                />
              </a>
              <div className="media-card__body">
                <h4>Wind mill blade of Siemen&rsquo;s Gamesa being transported</h4>
              </div>
            </article>

            <article className="media-card" data-reveal="">
              <a
                className="media-card__figure"
                href="/images/existing-2.png"
                data-lightbox=""
                data-caption="An export consignments of ADJ & Brothers"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/existing-2.png"
                  alt="An export consignments of ADJ & Brothers"
                  loading="lazy"
                />
              </a>
              <div className="media-card__body">
                <h4>An export consignments of ADJ &amp; Brothers</h4>
              </div>
            </article>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
