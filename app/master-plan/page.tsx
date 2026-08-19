import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Master Plan | IFFCO Kisan SEZ",
  description:
    "The IFFCO Kisan SEZ master plan — layout of the Multiproduct SEZ and Domestic Tariff Area at SPSR Nellore, Andhra Pradesh.",
};

export default function MasterPlan() {
  return (
    <>
      <PageHero
        title="Master Plan"
        subtitle="Click the plan to view it full size."
        banner="/images/master-plan-banner.png"
      />

      <section className="section">
        <div className="container">
          <figure style={{ margin: 0 }} data-reveal="">
            <a
              href="/images/map-iksez.png"
              data-lightbox=""
              data-caption="IFFCO Kisan SEZ — Master Plan"
              style={{
                display: "block",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/map-iksez.png"
                alt="IFFCO Kisan SEZ master plan"
                loading="lazy"
                style={{ width: "100%" }}
              />
            </a>
            <figcaption className="figure-caption">IFFCO Kisan SEZ &mdash; Master Plan</figcaption>
          </figure>

          <div className="flex mt-8" style={{ justifyContent: "center" }} data-reveal="">
            <a className="btn btn--brand" href="#">
              Download Master Plan
            </a>
            <Link className="btn btn--outline" href="/contact-us/">
              Request a site visit
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--tight section--alt">
        <div className="container">
          <div className="stats" data-reveal="">
            <div className="stat">
              <div className="stat__value">
                <span data-count="1900">1,900</span>
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
                <span data-count="2776.23">2,776.23</span>
              </div>
              <p className="stat__label">Total acres under development at SPSR Nellore</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="27">27</span> km
              </div>
              <p className="stat__label">Boundary wall securing the site</p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
