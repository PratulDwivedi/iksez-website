import type { Metadata } from "next";
import {
  Atom,
  BatteryCharging,
  Beef,
  Boxes,
  Factory,
  FlaskConical,
  Laptop,
  Leaf,
  Milk,
  Pill,
  Recycle,
  Sun,
  Tractor,
  Warehouse,
  Wheat,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import FeatureCard from "@/components/FeatureCard";

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
        banner="/images/business-opp-banner.webp"
      />

      {/* ================= GROUPED SECTORS ================= */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Agro &amp; Food Processing</span>
            <h2>Sectors with defined product lines</h2>
          </div>

          <div className="accordion">
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
          <div className="section-head" data-reveal="">
            <span className="eyebrow">More sectors</span>
            <h2>Open for investment</h2>
          </div>

          <div className="grid grid--4">
            <FeatureCard title="Meat & Poultry" icon={<Beef />}>
              Processing and value-addition units for meat and poultry products.
            </FeatureCard>
            <FeatureCard title="Dairy Processing" icon={<Milk />}>
              Milk processing, packaging and dairy product manufacturing.
            </FeatureCard>
            <FeatureCard title="Medicinal & Aromatic plants" icon={<Leaf />}>
              Cultivation and processing of medicinal, herbal and aromatic plant produce.
            </FeatureCard>
            <FeatureCard title="Feed Manufacturing" icon={<Wheat />}>
              Manufacturing of animal and poultry feed for the surrounding agricultural belt.
            </FeatureCard>
            <FeatureCard title="Nutraceuticals & Food Additives (ex. Pectin)" icon={<Pill />}>
              Nutraceutical and food-additive units, including pectin extraction from fruit waste.
            </FeatureCard>
            <FeatureCard title="Spices" icon={<FlaskConical />}>
              Processing, grading and packaging of spices for domestic and export markets.
            </FeatureCard>
            <FeatureCard title="Agri Implements and Automobiles" icon={<Tractor />}>
              Manufacturing of agricultural implements, machinery and automotive components.
            </FeatureCard>
            <FeatureCard title="Renewable Energy" icon={<Sun />}>
              Solar, wind and other renewable energy generation and equipment manufacturing.
            </FeatureCard>
            <FeatureCard title="Electric Mobility and Associated Products and Batteries" icon={<BatteryCharging />}>
              EV manufacturing, batteries and components for electric mobility.
            </FeatureCard>
            <FeatureCard title="Circular Economy" icon={<Recycle />}>
              Recycling, waste-to-value and other circular economy initiatives.
            </FeatureCard>
            <FeatureCard title="Nano and Other Innovative Technologies" icon={<Atom />}>
              Nanotechnology and other innovative, high-value manufacturing units.
            </FeatureCard>
            <FeatureCard title="Other Light and Heavy Engineering Industries" icon={<Factory />}>
              Light and heavy engineering units serving domestic and export demand.
            </FeatureCard>
            <FeatureCard title="IT/BPO" icon={<Laptop />}>
              IT and business process outsourcing operations backed by ready office infrastructure.
            </FeatureCard>
            <FeatureCard title="Warehouses and Logistics" icon={<Warehouse />}>
              Warehousing, cold storage and logistics leveraging NH-16 and port connectivity.
            </FeatureCard>
            <FeatureCard
              title="Any other manufacturing/services industries feasible at IKSEZ location"
              icon={<Boxes />}
              className="card--dark"
            >
              Open to any other manufacturing or services industry suited to the IKSEZ location.
            </FeatureCard>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
