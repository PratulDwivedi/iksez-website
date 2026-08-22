import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

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

      {/* ================= INTRO ================= */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div className="split__figure split__figure--frame" data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/inner-image1.webp" alt="IFFCO Kisan SEZ project site" loading="lazy" />
            </div>
            <div data-reveal="">
              <div className="section-head">
                <span className="eyebrow">Who we are</span>
                <h2>IFFCO Kisan SEZ Limited</h2>
              </div>
              <p className="lead">
                IFFCO Kisan SEZ Limited (IKSEZ) is a wholly owned subsidiary and a unique
                initiative of IFFCO, a globally acclaimed cooperative institution, with the
                objective of promoting industrial growth, generate employment and contribute to
                overall development of the region as well the country.
              </p>
              <p>
                Towards this, IKSEZ is being developed in an area of 2776.23 Acres at SPSR
                Nellore, Andhra Pradesh. As a developer of the industrial park, IKSEZ strives to
                provide best in class infrastructure and services to investors so that they can
                work in a hassle free manner focusing on their business goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NUMBERS ================= */}
      <section className="section section--tight section--alt">
        <div className="container">
          <div className="stats" data-reveal="">
            <div className="stat">
              <div className="stat__value">
                <span data-count="2776.23">2,776.23</span>
              </div>
              <p className="stat__label">Acres under development at SPSR Nellore, Andhra Pradesh</p>
            </div>
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
          </div>
        </div>
      </section>

      {/* ================= VISION & MISSION ================= */}
      <section className="section">
        <div className="container">
          <div className="grid grid--2">
            <article className="card" data-reveal="" style={{ padding: "var(--sp-8)" }}>
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3>Vision</h3>
              <p className="lead" style={{ color: "var(--color-neutral-600)" }}>
                To set up industrial infrastructure to foster industry, economic growth,
                sustainable economic development and create employment opportunities.
              </p>
            </article>

            <article className="card" data-reveal="" style={{ padding: "var(--sp-8)" }}>
              <div className="card__icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.4" />
                </svg>
              </div>
              <h3>Mission</h3>
              <p className="lead" style={{ color: "var(--color-neutral-600)" }}>
                To develop state of the art Industrial Park through a unique &ldquo;Farmer Owned
                &ndash; Farmer Managed &ndash; Farmer Focused&rdquo; industrial park with world
                class infrastructure for setting up multiproduct units and attract domestic and
                global manufacturing entrepreneurs with a focus on agro-based industries.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ================= Management ================= */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div
              className="split__figure split__figure--frame"
              data-reveal=""
              style={{ maxWidth: "420px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/board-of-directors/rakesh2.jpg"
                alt="Mr. Rakesh Kapur, Managing Director IKSEZ"
                loading="lazy"
              />
            </div>

            <div data-reveal="">
              <span className="chip chip--green" style={{ marginBottom: "1rem" }}>
                Managing Director IKSEZ
              </span>
              <h2>Mr. Rakesh Kapur</h2>

              <p>
                Mr. Rakesh Kapur is the Jt. Managing Director and CFO, Indian Farmers Fertiliser
                Cooperative Ltd (IFFCO), which is the largest fertilizer Cooperative in the world
                with a turnover of USD 5.00 Billion (2011-12). Apart from planning, managing and
                monitoring the Finance and Accounts related functions of IFFCO, he has also been
                extensively involved with all the new Projects, Acquisitions, Joint Ventures and
                Diversification initiatives of IFFCO from their stage of inception.
              </p>

              <p>
                Mr. Rakesh Kapur is an ex-Indian Revenue Service Officer (1978 Batch) who has held
                various senior assignments in Government of India, which included Joint Secretary
                (Commercial), Telecom Regulatory Authority of India (TRAI); Director in the
                Ministry of Chemicals &amp; Fertilizers, Additional Assessor &amp; Collector,
                Municipal Corporation of Delhi apart from the postings in the Income Tax
                Department.
              </p>

              <p>
                Mr. Rakesh Kapur is also the Managing Director, IFFCO Kisan SEZ Ltd (IKSEZ), which
                is a wholly owned subsidiary of IFFCO.
              </p>

              <p>
                Born on September 26, 1954, Mr. Kapur holds B.Tech. Degree in Mechanical
                Engineering (in First Class with Distinction) from Indian Institute of Technology
                (IIT), New Delhi and a Post Graduation in Management. He has traveled widely and
                participated in various national and international Seminars / Conferences, and
                presented papers on different subjects. He is a Director on the Boards of a number
                of Indian / Overseas Companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
