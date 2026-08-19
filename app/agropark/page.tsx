import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Agropark | IFFCO Kisan SEZ",
  description:
    "An Agropark is a systems innovation of metropolitan agro production, processing and logistics, enabling a demand driven combination and integration of various agricultural activities.",
};

export default function Agropark() {
  return (
    <>
      <PageHero
        title="Agropark"
        subtitle="A demand driven combination and integration of various agricultural activities."
        banner="/images/agropark-banner.webp"
      />

      {/* ================= CONCEPT ================= */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div className="split__figure" data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/agropark-image.webp" alt="The Agropark concept" loading="lazy" />
            </div>
            <div data-reveal="">
              <div className="section-head">
                <span className="eyebrow">The Agropark Concept</span>
                <h2>Production, processing and logistics as one system</h2>
              </div>
              <p className="lead">
                An Agropark is a systems innovation of metropolitan agro production, processing
                and logistics. As part of an Intelligent Agro-logistic Network, it enables a
                demand driven combination and integration of various agricultural activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMPONENTS ================= */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--center" data-reveal="">
            <span className="eyebrow">Components of Agropark</span>
            <h2>Part of an Intelligent Agro-logistics Network</h2>
          </div>

          <div className="split">
            <div className="split__figure" data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/components.webp" alt="Components of the Agropark" loading="lazy" />
            </div>
            <div data-reveal="">
              <p>
                The Agropark will be part of Intelligent Agro-logistics Network (IAN), consisting
                of Agro-park with Rural Transformation Centres, Export Oriented Centres and
                Domestic Tariff Area (DTA). The Rural Transformation Centres would be a collection
                point for raw materials supplied by the farmers and would also offer agriculture
                extension services to the farmers, warehousing, banking, cold storage facilities
                etc.
              </p>
              <p>
                The products from Rural Transformation Centres would go to the Agropark for
                further processing. The Agropark would be made up of cluster of units such as
                production unit, processing plants, research &amp; development, trade and social
                activities. For performing all the above functions a high-tech, state of the art
                infrastructure is being developed. The products from the Agropark will go to the
                customers and retail outlets.
              </p>
              <p>
                An Agropark with components of production, processing, trade, demonstration,
                R&amp;D, capacity building and social functions, delivers its products throughout
                the whole year as efficient as possible, independent of season and land.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NETWORK PARTS ================= */}
      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 21h18M6 21V10l6-4 6 4v11" />
                  <path d="M10 21v-5h4v5" />
                </svg>
              </div>
              <h3>Rural Transformation Centres</h3>
              <p>
                A collection point for raw materials supplied by the farmers, also offering
                agriculture extension services, warehousing, banking and cold storage facilities.
              </p>
            </article>
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="7" width="14" height="12" rx="2" />
                  <path d="M16 11h4l2 3v5h-6" />
                  <circle cx="7" cy="19" r="2" />
                  <circle cx="18" cy="19" r="2" />
                </svg>
              </div>
              <h3>Export Oriented Centres</h3>
              <p>
                Part of the Intelligent Agro-logistics Network alongside the Agropark and the
                Domestic Tariff Area.
              </p>
            </article>
            <article className="card" data-reveal="">
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M20 7 12 3 4 7v10l8 4 8-4V7z" />
                  <path d="m4 7 8 4 8-4M12 11v10" />
                </svg>
              </div>
              <h3>Domestic Tariff Area (DTA)</h3>
              <p>
                Designated for initiatives focused on the domestic Indian market, with better
                supply-chain linkages for ancillary units.
              </p>
            </article>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
