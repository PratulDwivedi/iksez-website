import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section text-center">
      <div className="container container--narrow">
        <span className="eyebrow" style={{ justifyContent: "center" }}>
          Error 404
        </span>
        <h1 style={{ fontSize: "var(--fs-3xl)" }}>We couldn&rsquo;t find that page</h1>
        <p className="lead">
          The page may have moved. Try one of the links below, or head back to the homepage.
        </p>
        <div className="flex mt-8" style={{ justifyContent: "center" }}>
          <Link className="btn btn--brand" href="/">
            Back to Home
          </Link>
          <Link className="btn btn--outline" href="/contact-us/">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
