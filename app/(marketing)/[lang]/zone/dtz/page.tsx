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
        banner="/images/infrastructur-banner.webp"
      />
      <section className="section">
        <div className="container container--narrow">
          <span className="eyebrow">Zone overview</span>
          <h2>Infrastructure for domestic market industries</h2>
          <p className="lead">
            The 877-acre Domestic Tariff Zone provides ready infrastructure, reliable utilities and
            multimodal connectivity for businesses focused on India&apos;s growing food and agro-based
            markets.
          </p>
          <div className="chip-row mt-6">
            <span className="chip chip--green">877 acres</span>
            <span className="chip chip--green">Ready utilities</span>
            <span className="chip chip--green">Domestic market focus</span>
          </div>
          <div className="mt-8">
            <Link className="btn btn--brand" href="/contact-us/">Talk to our team</Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
