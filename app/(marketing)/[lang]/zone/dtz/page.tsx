import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "DTZ | IFFCO Kisan SEZ",
  description: "Explore the Domestic Tariff Zone at IFFCO Kisan SEZ.",
};

export default function DtzPage() {
  return (
    <>
      <PageHero
        title="Domestic Tariff Zone"
        subtitle="A flexible operating environment for industries serving the domestic market."
      />

      {/* ================= OVERVIEW ================= */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div className="split__figure" data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/zones/dtz.svg" alt="Illustration of a factory, silos and a delivery truck among farm fields" />
            </div>
            <div data-reveal="">
              <div className="section-head">
                <span className="eyebrow">Zone overview</span>
                <h2>Infrastructure for domestic market industries</h2>
              </div>
              <p className="lead">
                The 877-acre Domestic Tariff Zone provides ready infrastructure, reliable utilities and
                multimodal connectivity for businesses focused on India&apos;s growing food and agro-based
                markets.
              </p>
              <ul className="check-list mt-6">
                <li>Better supply-chain linkages for ancillary units</li>
                <li>All incentives offered by state and central governments</li>
                <li>Centrally managed internal roads, drainage and ICT</li>
                <li>Skilled and semi-skilled manpower from surrounding locations</li>
              </ul>
              <div className="mt-8">
                <Link className="btn btn--brand" href="/contact-us/">Talk to our team</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK NUMBERS ================= */}
      <section className="section section--tight section--alt">
        <div className="container">
          <div className="stats" data-reveal="">
            <div className="stat">
              <div className="stat__value">
                <span data-count="877">877</span>
              </div>
              <p className="stat__label">Acres of Domestic Tariff Area</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="8">8</span> km
              </div>
              <p className="stat__label">Frontage on six-lane NH-16</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="100">100</span> MW
              </div>
              <p className="stat__label">Power dedicated to units from a 220 KV substation</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="160">160</span> km
              </div>
              <p className="stat__label">To Tirupati airport, 2.5 hours by road</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ADVANTAGES ================= */}
      <section className="section">
        <div className="container">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Why the DTZ</span>
            <h2>Close to farms, close to markets</h2>
          </div>
          <div className="grid grid--3">
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="7" width="14" height="12" rx="2" />
                  <path d="M16 11h4l2 3v5h-6" />
                  <circle cx="7" cy="19" r="2" />
                  <circle cx="18" cy="19" r="2" />
                </svg>
              </div>
              <h3>Road and rail access</h3>
              <p>
                On either side of NH-16 connecting Chennai to Kolkata, with the Grand Trunk twin rail
                lines adjacent and provision for a railway siding.
              </p>
            </article>
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.7C8 7.2 6 10.5 6 13a6 6 0 0 0 12 0c0-2.5-2-5.8-6-10.3z" />
                </svg>
              </div>
              <h3>Assured utilities</h3>
              <p>
                100 MW of dedicated power and assured water in different qualities, drawn from the
                Pennar River System.
              </p>
            </article>
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M20 7 12 3 4 7v10l8 4 8-4V7z" />
                  <path d="m4 7 8 4 8-4M12 11v10" />
                </svg>
              </div>
              <h3>Integrated agropark</h3>
              <p>
                Common warehousing, office space and processing of waste and byproducts, as part
                of the IFFCO Kisan agropark.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ================= OTHER ZONE ================= */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Also at IFFCO Kisan SEZ</span>
            <h2>Exporting from India?</h2>
          </div>
          <article className="home-zone-card" data-reveal="">
            <div className="home-zone-card__image home-zone-card__image--sez" />
            <div className="home-zone-card__body">
              <h3>SEZ</h3>
              <div className="home-zone-card__sub">Special Economic Zone</div>
              <p>A dedicated zone for export-oriented units with world-class infrastructure, customs benefits and seamless logistics support.</p>
              <Link href="/zone/sez/">Explore SEZ →</Link>
            </div>
          </article>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
