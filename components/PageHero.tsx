type PageHeroProps = {
  title: string;
  subtitle?: string;
  banner?: string;
};

export default function PageHero({ title, subtitle }: PageHeroProps) {
  const words = title.split(" ");
  const accentWord = words.pop();

  return (
    <section className="page-intro">
      <div className="container">
        <span className="page-intro__eyebrow">IFFCO KISAN SEZ</span>
        <h1>
          {words.length > 0 && `${words.join(" ")} `}
          <span className="accent">{accentWord}</span>
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
