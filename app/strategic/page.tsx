import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Benefits – Strategic | IFFCO Kisan SEZ",
  description:
    "Strategic advantages of IFFCO Kisan SEZ — infrastructure bundle, industrial ecology, 220 KV substation, assured water, skilled manpower and multimodal connectivity.",
};

export default function Strategic() {
  return (
    <>
      <PageHero
        title="Strategic"
        subtitle="Area by area, the advantages that come with locating at IFFCO Kisan SEZ."
        banner="/images/benifit-banner.webp"
      />

      <section className="section section--tight">
        <div className="container">
          <div className="chip-row" data-reveal="">
            <Link className="btn btn--outline btn--sm" href="/tax/">
              Tax
            </Link>
            <Link className="btn btn--brand btn--sm" href="/strategic/">
              Strategic
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="table-wrap" data-reveal="">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Area</th>
                  <th scope="col">Advantages</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Infrastructure bundle</td>
                  <td>
                    <ul>
                      <li>Internal roads, drainage, waste management, ICT etc</li>
                      <li>Centrally managed infrastructure</li>
                      <li>Common office space, ware housing facility etc</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td>Industrial Ecology</td>
                  <td>Common processing of waste and byproducts</td>
                </tr>
                <tr>
                  <td>Power</td>
                  <td>220 KV Substation to supply 100 MW of Power dedicated to Units in IKSEZ</td>
                </tr>
                <tr>
                  <td>Water</td>
                  <td>
                    <ul>
                      <li>Assured water supply in different and specific qualities</li>
                      <li>
                        Approval from State Government to draw 10 Million Gallons per Day (MGD)
                        from the nearest Reservoir with source from Pennar River System.
                      </li>
                      <li>Twin water pipelines laid for a distance of 13 km length to draw 45 MLD of water.</li>
                      <li>An Internal Water Pond spread across 79 Acres (31 Ha).</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td>Manpower</td>
                  <td>
                    <ul>
                      <li>Skilled and semi-skilled manpower available from surrounding locations</li>
                      <li>Provision of social infrastructure to employees</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td>Connectivity</td>
                  <td>
                    <p>
                      <strong>Air</strong>
                    </p>
                    <ul>
                      <li>Chennai - 200 km (3.5 Hrs by Road)</li>
                      <li>Tirupati - 160 km (2.5 Hrs by Road)</li>
                      <li>Vijayawada - 230 km (4.0 Hrs by Road)</li>
                      <li>Domestic airport of Nellore expected to come close to the site.</li>
                    </ul>
                    <p style={{ marginTop: "1rem" }}>
                      <strong>Sea</strong>
                    </p>
                    <ul>
                      <li>Krishnapatnam Port - 60 km</li>
                      <li>Chennai Port - 200 km</li>
                    </ul>
                    <p style={{ marginTop: "1rem" }}>
                      <strong>Road:</strong> Located on either side of six lane major National
                      Highway (NH-16) connecting Chennai to Kolkata with an 8 km frontage.
                    </p>
                    <p>
                      <strong>Rail:</strong> Grand Trunk (Chennai to Kolkata) twin lines pass
                      adjacent to the site. Provision for a Railway Siding.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>SEZ Status</td>
                  <td>Notified Multi Product SEZ.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= QUICK NUMBERS ================= */}
      <section className="section section--tight section--alt">
        <div className="container">
          <div className="stats" data-reveal="">
            <div className="stat">
              <div className="stat__value">
                <span data-count="100">100</span> MW
              </div>
              <p className="stat__label">Power dedicated to Units in IKSEZ from a 220 KV Substation</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="45">45</span> MLD
              </div>
              <p className="stat__label">Drawn through twin water pipelines laid over 13 km</p>
            </div>
            <div className="stat">
              <div className="stat__value">
                <span data-count="79">79</span>
              </div>
              <p className="stat__label">Acres (31 Ha) internal water pond</p>
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

      <CtaBand />
    </>
  );
}
