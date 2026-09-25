type PageHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Retained for page-call compatibility; the flat header no longer renders a background image. */
  banner?: string;
};

export default function PageHero({ title, subtitle, eyebrow = "IFFCO Kisan SEZ" }: PageHeroProps) {
  return (
    <section className="section section--tight page-hero">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
