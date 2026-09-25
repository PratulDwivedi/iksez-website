import Link from "next/link";

// Next.js renders this (with a real 404 status) instead of the root
// app/(marketing)/not-found.tsx when notFound() is called from this
// segment's page.tsx — the root one points back to "/", which would
// silently bounce a bad blog link instead of pointing at the blog itself.
export default function BlogPostNotFound() {
  return (
    <section className="section text-center">
      <div className="container container--narrow">
        <span className="eyebrow" style={{ justifyContent: "center" }}>
          Error 404
        </span>
        <h1 style={{ fontSize: "var(--fs-3xl)" }}>Article not found</h1>
        <p className="lead">The article you&rsquo;re looking for may have been moved or unpublished.</p>
        <div className="flex mt-8" style={{ justifyContent: "center" }}>
          <Link className="btn btn--brand" href="/blog/">
            Back to Blog
          </Link>
          <Link className="btn btn--outline" href="/">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
