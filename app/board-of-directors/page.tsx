import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Management Team | IFFCO Kisan SEZ",
  description:
    "Mr. Rakesh Kapur, Managing Director, IFFCO Kisan SEZ Limited (IKSEZ), a wholly owned subsidiary of IFFCO.",
};

export default function BoardOfDirectors() {
  return (
    <>
      <PageHero title="Management Team" banner="/images/about-us-banner.png" />

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
