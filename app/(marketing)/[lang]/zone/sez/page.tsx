import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "SEZ | IFFCO Kisan SEZ",
  description: "Explore the multiproduct Special Economic Zone at IFFCO Kisan SEZ.",
};

export default function SezPage() {
  return (
    <>
      <PageHero
        title="Special Economic Zone"
        subtitle="A notified multiproduct SEZ for export-oriented agro-industrial growth."
      />

      {/* ================= OVERVIEW ================= */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div className="split__figure" data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/zones/sez.svg" alt="Illustration of an export port with a container ship and gantry crane" />
            </div>
            <div data-reveal="">
              <div className="section-head">
                <span className="eyebrow">Zone overview</span>
                <h2>Built for integrated agro-industrial activity</h2>
              </div>
              <p className="lead">
                The 1,900-acre SEZ brings together processing, logistics, utilities and support
                infrastructure in one connected ecosystem, with the incentives available under the
                SEZ framework.
              </p>
              <ul className="check-list mt-6">
                <li>Duty free import of machinery and raw material</li>
                <li>Zero rated GST on supplies to SEZ units</li>
                <li>Relief from capital gains tax on relocation to SEZ units</li>
                <li>Other incentives offered by state and central governments</li>
              </ul>
              <div className="mt-8">
                <Link className="btn btn--brand" href="/invitation-for-investors/">Explore business opportunities</Link>
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
                <span data-count="1900">1,900</span>
              </div>
              <p className="stat__label">Acres of notified multiproduct SEZ</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="100">100</span> MW
              </div>
              <p className="stat__label">Power dedicated to units from a 220 KV substation</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="45">45</span> MLD
              </div>
              <p className="stat__label">Water drawn through twin pipelines laid over 13 km</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="60">60</span> km
              </div>
              <p className="stat__label">To Krishnapatnam Port</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ADVANTAGES ================= */}
      <section className="section">
        <div className="container">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Why the SEZ</span>
            <h2>Export-ready from day one</h2>
          </div>
          <div className="grid grid--3">
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 21h18M5 21V9l7-5 7 5v12" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </div>
              <h3>Infrastructure bundle</h3>
              <p>
                Centrally managed internal roads, drainage, waste management and ICT, with common
                office space and warehousing.
              </p>
            </article>
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
              </div>
              <h3>Power and water</h3>
              <p>
                A 220 KV substation supplying 100 MW, and assured water from the Pennar River
                System backed by a 79-acre internal pond.
              </p>
            </article>
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M2 20h20M4 16l3-9h10l3 9" />
                  <path d="M12 7V3M9 16v4M15 16v4" />
                </svg>
              </div>
              <h3>Multimodal connectivity</h3>
              <p>
                8 km frontage on six-lane NH-16, the Chennai–Kolkata rail line alongside, and
                Krishnapatnam Port 60 km away.
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
            <h2>Serving the domestic market?</h2>
          </div>
          <article className="home-zone-card" data-reveal="">
            <div className="home-zone-card__image home-zone-card__image--dtz" />
            <div className="home-zone-card__body">
              <h3>DTZ</h3>
              <div className="home-zone-card__sub">Domestic Tariff Zone</div>
              <p>Designed for domestic market industries with flexible operations and a conducive business environment.</p>
              <Link href="/zone/dtz/">Explore DTZ →</Link>
            </div>
          </article>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
