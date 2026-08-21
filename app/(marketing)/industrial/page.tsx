import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Infrastructure | IFFCO Kisan SEZ",
  description:
    "Ready availability of infrastructure for new industries at IFFCO Kisan SEZ — water storage pond, pump house, 220 kV power station, boundary wall, internal and peripheral roads, office space and amenities.",
};

const ITEMS = [
  { src: "/images/water-1.webp", caption: "Water Storage Pond (79 Acres)" },
  {
    src: "/images/pump-house.webp",
    caption: "Pump House with 13 km pipe line to draw water from approved Reservoir",
  },
  { src: "/images/power-station.jpg", caption: "220 kV Power Station for Power Supply" },
  { src: "/images/security.webp", caption: "Security with 27 km Boundary Wall" },
  { src: "/images/internal-road.webp", caption: "Internal Roads" },
  { src: "/images/Peripheral-Roads.jpg", caption: "Peripheral Roads" },
  { src: "/images/ready-space.webp", caption: "Ready to Use Office Space" },
  { src: "/images/hall.jpg", caption: "Conference Hall and Amenities" },
];

export default function Industrial() {
  return (
    <>
      <PageHero
        title="Infrastructure"
        subtitle="Ready Availability of Infrastructure for New Industries"
        banner="/images/infrastructur-banner.webp"
      />

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Industrial</span>
            <h2>Ready Availability of Infrastructure for New Industries</h2>
          </div>

          <div className="grid grid--3">
            {ITEMS.map((item) => (
              <article className="media-card" data-reveal="" key={item.src}>
                <a className="media-card__figure" href={item.src} data-lightbox="" data-caption={item.caption}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.caption} loading="lazy" />
                </a>
                <div className="media-card__body">
                  <h3 className="industrial-card__title">{item.caption}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
