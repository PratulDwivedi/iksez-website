import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Benefits | IFFCO Kisan SEZ",
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

      {/* ================= TAX ================= */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
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

        </div>
      </section>

      {/* ================= STRATEGIC ADVANTAGES ================= */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Strategic</span>
            <h2>Advantages of locating at IKSEZ</h2>
            <p>Area by area, the advantages that come with locating at IFFCO Kisan SEZ.</p>
          </div>

          <div className="table-wrap">
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
                      <li>Approval from State Government to draw 10 Million Gallons per Day (MGD) from the nearest Reservoir with source from Pennar River System.</li>
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
                    <p><strong>Air</strong></p>
                    <ul>
                      <li>Chennai - 200 km (3.5 Hrs by Road)</li>
                      <li>Tirupati - 160 km (2.5 Hrs by Road)</li>
                      <li>Vijayawada - 230 km (4.0 Hrs by Road)</li>
                      <li>Domestic airport of Nellore expected to come close to the site.</li>
                    </ul>
                    <p style={{ marginTop: "1rem" }}><strong>Sea</strong></p>
                    <ul>
                      <li>Krishnapatnam Port - 60 km</li>
                      <li>Chennai Port - 200 km</li>
                    </ul>
                    <p style={{ marginTop: "1rem" }}><strong>Road:</strong> Located on either side of six lane major National Highway (NH-16) connecting Chennai to Kolkata with an 8 km frontage.</p>
                    <p><strong>Rail:</strong> Grand Trunk (Chennai to Kolkata) twin lines pass adjacent to the site. Provision for a Railway Siding.</p>
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

      <section className="section section--tight">
        <div className="container">
          <div className="stats">
            <div className="stat">
              <div className="stat__value"><span data-count="100">100</span> MW</div>
              <p className="stat__label">Power dedicated to Units in IKSEZ from a 220 KV Substation</p>
            </div>
            <div className="stat">
              <div className="stat__value"><span data-count="45">45</span> MLD</div>
              <p className="stat__label">Drawn through twin water pipelines laid over 13 km</p>
            </div>
            <div className="stat">
              <div className="stat__value"><span data-count="79">79</span></div>
              <p className="stat__label">Acres (31 Ha) internal water pond</p>
            </div>
            <div className="stat">
              <div className="stat__value"><span data-count="60">60</span> km</div>
              <p className="stat__label">To Krishnapatnam Port</p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
