import Link from "next/link";

export default function CtaBand() {
  return (
    <section className="section section--tight">
      <div className="container">
        <div className="cta-band" data-reveal="">
          <span className="eyebrow">Invest with IKSEZ</span>
          <h2>Ready to set up at IFFCO Kisan SEZ?</h2>
          <p>
            Duty free imports, zero rated GST on supplies to SEZ units, assured power and water,
            and a notified multi&#8209;product SEZ on NH&#8209;16 with 8&nbsp;km frontage.
          </p>
          <div className="flex">
            <Link className="btn btn--green btn--lg" href="/contact-us/">
              Talk to our team
            </Link>
            <Link className="btn btn--outline btn--lg" href="/invitation-for-investors/">
              Business Opportunities
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
