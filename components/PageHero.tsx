import Link from "next/link";

export type Breadcrumb = {
  label: string;
  /** Omitted for the current page and for entries that aren't pages. */
  href?: string;
};

type PageHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Trail above the title, ending with the current page (rendered unlinked). */
  breadcrumbs?: Breadcrumb[];
  /** Retained for page-call compatibility; the flat header no longer renders a background image. */
  banner?: string;
};

export default function PageHero({ title, subtitle, eyebrow = "IFFCO Kisan SEZ", breadcrumbs }: PageHeroProps) {
  return (
    <section className="section section--tight page-hero">
      <div className="container">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="page-hero__crumbs">
              {breadcrumbs.map((crumb, index) => {
                const isCurrent = index === breadcrumbs.length - 1;
                return (
                  <li key={`${index}-${crumb.label}`} aria-current={isCurrent ? "page" : undefined}>
                    {crumb.href && !isCurrent ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <div className="section-head">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
