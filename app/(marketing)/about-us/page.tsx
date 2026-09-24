import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import FeatureCard from "@/components/FeatureCard";

export const metadata: Metadata = {
  title: "About us | IFFCO Kisan SEZ",
  description:
    "IFFCO Kisan SEZ Limited (IKSEZ) is a wholly owned subsidiary and a unique initiative of IFFCO, being developed in an area of 2776.23 Acres at SPSR Nellore, Andhra Pradesh.",
};

export default function AboutUs() {
  return (
    <>
      <PageHero
        title="About us"
        subtitle="A wholly owned subsidiary and a unique initiative of IFFCO, a globally acclaimed cooperative institution."
        banner="/images/about-us-banner.webp"
      />

      {/* ================= ABOUT + STATS ================= */}
      <section className="home-about">
        <div className="container">
          <div className="home-about__grid">
            <div className="home-about__copy">
              <div className="home-reference__kicker">Who we are</div>
              <h2>IFFCO Kisan SEZ Limited</h2>
              <p>IFFCO Kisan SEZ Limited (IKSEZ) is a wholly owned subsidiary and a unique initiative of IFFCO, a globally acclaimed cooperative institution, with the objective of promoting industrial growth, generating employment and contributing to the overall development of the region and the country.</p>
              <p>Towards this, IKSEZ is being developed over 2,776.23 acres at SPSR Nellore, Andhra Pradesh. As the developer of the industrial park, IKSEZ provides best-in-class infrastructure and services so investors can focus on their business goals.</p>
            </div>
            <div className="home-stats">
              <div><span className="home-stat__icon">▧</span><strong>2,776.23</strong><small>Acres under<br />development</small></div>
              <div><span className="home-stat__icon">♧</span><strong>1,900</strong><small>Acres of Multiproduct<br />SEZ</small></div>
              <div><span className="home-stat__icon">⌂</span><strong>877</strong><small>Acres of Domestic<br />Tariff Area</small></div>
              <div><span className="home-stat__icon">⌁</span><strong>8 km</strong><small>NH-16<br />frontage</small></div>
          </div>
        </div>
        </div>
      </section>

      {/* ================= VISION & MISSION ================= */}
      <section className="home-reference-section home-reference-section--alt">
        <div className="container">
          <div className="home-section-head">
            <div>
              <div className="home-reference__kicker">Our Purpose</div>
              <h2>Vision and mission</h2>
            </div>
          </div>
          <div className="grid grid--2 home-purpose-grid">
            <FeatureCard
              title="Vision"
              icon={<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>}
            >
              To set up industrial infrastructure to foster industry, economic growth, sustainable economic development and create employment opportunities.
            </FeatureCard>
            <FeatureCard
              title="Mission"
              icon={<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></svg>}
            >
              To develop state of the art Industrial Park through a unique &ldquo;Farmer Owned &ndash; Farmer Managed &ndash; Farmer Focused&rdquo; industrial park with world class infrastructure for setting up multiproduct units and attract domestic and global manufacturing entrepreneurs with a focus on agro-based industries.
            </FeatureCard>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
