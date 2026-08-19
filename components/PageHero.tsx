import Link from "next/link";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  banner: string;
};

export default function PageHero({ title, subtitle, banner }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero__bg" style={{ backgroundImage: `url('${banner}')` }}></div>
      <div className="container">
        <ol className="breadcrumb">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <span aria-current="page">{title}</span>
          </li>
        </ol>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
