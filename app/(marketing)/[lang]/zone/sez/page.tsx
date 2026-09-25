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
        banner="/images/business-opp-banner.webp"
      />
      <section className="section">
        <div className="container container--narrow">
          <span className="eyebrow">Zone overview</span>
          <h2>Built for integrated agro-industrial activity</h2>
          <p className="lead">
            The 1,900-acre SEZ brings together processing, logistics, utilities and support
            infrastructure in one connected ecosystem, with the incentives available under the
            SEZ framework.
          </p>
          <div className="chip-row mt-6">
            <span className="chip chip--green">1,900 acres</span>
            <span className="chip chip--green">NH-16 frontage</span>
            <span className="chip chip--green">Export-ready infrastructure</span>
          </div>
          <div className="mt-8">
            <Link className="btn btn--brand" href="/invitation-for-investors/">Explore business opportunities</Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
