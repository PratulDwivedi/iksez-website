import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Benefits – Tax | IFFCO Kisan SEZ",
  description:
    "All prevailing tax exemptions as per the SEZ Act and the other policies of the Government — duty free import, zero rated GST on supplies to SEZ units and relief from capital gains tax.",
};

export default function Tax() {
  return (
    <>
      <PageHero
        title="Benefits"
        subtitle="Tax concessions under the SEZ Act, plus the strategic advantages of the IKSEZ location."
        banner="/images/benifit-banner.webp"
      />

      {/* ================= TABS ================= */}
      <section className="section section--tight">
        <div className="container">
          <div className="chip-row" data-reveal="">
            <Link className="btn btn--brand btn--sm" href="/tax/">
              Tax
            </Link>
            <Link className="btn btn--outline btn--sm" href="/strategic/">
              Strategic
            </Link>
          </div>
        </div>
      </section>

      {/* ================= TAX ================= */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Tax</span>
            <h2>Multi-Product SEZ</h2>
            <p>All prevailing tax exemptions as per the SEZ Act and the other policies of the Government.</p>
          </div>

          <div className="grid grid--2">
            <article className="card" data-reveal="" style={{ padding: "var(--sp-8)" }}>
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3>Multi-Product SEZ</h3>
              <ul className="check-list mt-6">
                <li>Duty Free Import of machinery and raw material.</li>
                <li>Zero rated GST on supplies to SEZ units.</li>
                <li>Relief from Capital Gains Tax on relocation to SEZ units.</li>
                <li>Other incentives offered by state and central governments.</li>
              </ul>
            </article>

            <article className="card" data-reveal="" style={{ padding: "var(--sp-8)" }}>
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="7" width="14" height="12" rx="2" />
                  <path d="M16 11h4l2 3v5h-6" />
                  <circle cx="7" cy="19" r="2" />
                  <circle cx="18" cy="19" r="2" />
                </svg>
              </div>
              <h3>Domestic Tariff Area (DTA)</h3>
              <ul className="check-list mt-6">
                <li>Better Supply-Chain linkages for ancillary units.</li>
                <li>All incentives offered by state and central governments.</li>
              </ul>
            </article>
          </div>

          <div className="mt-8" data-reveal="">
            <Link className="link-arrow" href="/strategic/">
              See the strategic advantages
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
