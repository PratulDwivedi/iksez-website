import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Business Opportunities | IFFCO Kisan SEZ",
  description:
    "The business opportunities that invite you to IFFCO Kisan SEZ — food processing, aquaculture, dairy, renewable energy, electric mobility, engineering, IT/BPO, warehousing and logistics.",
};

export default function InvitationForInvestors() {
  return (
    <>
      <PageHero
        title="Business Opportunities"
        subtitle="The business opportunities that invite you to IFFCO Kisan SEZ"
        banner="/images/business-opp-banner.png"
      />

      {/* ================= GROUPED SECTORS ================= */}
      <section className="section">
        <div className="container">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Agro &amp; Food Processing</span>
            <h2>Sectors with defined product lines</h2>
          </div>

          <div className="accordion" data-reveal="">
            <div className="accordion__item">
              <h3 style={{ margin: 0 }}>
                <button className="accordion__btn" type="button" aria-expanded="true" aria-controls="op-1">
                  Processed Fruits &amp; Vegetables
                </button>
              </h3>
              <div className="accordion__panel is-open" id="op-1">
                <ul className="check-list">
                  <li>Mango</li>
                  <li>Citrus (Acid Lime and Sweet Lime)</li>
                  <li>Papaya</li>
                  <li>Tomato and varied vegetable crops</li>
                  <li>Sapota</li>
                  <li>IQF / Freeze dried / RTC / RTE / Pickles</li>
                  <li>Juices, Jams, Jellies, pulp making</li>
                  <li>Snack foods</li>
                </ul>
              </div>
            </div>

            <div className="accordion__item">
              <h3 style={{ margin: 0 }}>
                <button className="accordion__btn" type="button" aria-expanded="false" aria-controls="op-2">
                  Processing of cereals and pulses
                </button>
              </h3>
              <div className="accordion__panel" id="op-2">
                <ul className="check-list">
                  <li>Ready to eat</li>
                  <li>Bakery</li>
                  <li>Biscuits</li>
                  <li>Primary processing and milling</li>
                  <li>Snack Foods</li>
                </ul>
              </div>
            </div>

            <div className="accordion__item">
              <h3 style={{ margin: 0 }}>
                <button className="accordion__btn" type="button" aria-expanded="false" aria-controls="op-3">
                  Aquaculture
                </button>
              </h3>
              <div className="accordion__panel" id="op-3">
                <ul className="check-list">
                  <li>Fish</li>
                  <li>Shrimp</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ALL OTHER SECTORS ================= */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--center" data-reveal="">
            <span className="eyebrow">More sectors</span>
            <h2>Open for investment</h2>
          </div>

          <div className="grid grid--4">
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Meat &amp; Poultry</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Dairy Processing</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Medicinal &amp; Aromatic plants</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Feed Manufacturing</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>
                Nutraceuticals &amp; Food Additives (ex. Pectin)
              </h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Spices</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Agri Implements and Automobiles</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Renewable Energy</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>
                Electric Mobility and Associated Products and Batteries
              </h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Circular Economy</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Nano and Other Innovative Technologies</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Other Light and Heavy Engineering Industries</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>IT/BPO</h4>
            </div>
            <div className="card" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>Warehouses and Logistics.</h4>
            </div>
            <div className="card card--dark" data-reveal="">
              <h4 style={{ margin: 0, fontSize: "var(--fs-base)" }}>
                Any other manufacturing/services industries feasible at IKSEZ location
              </h4>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
