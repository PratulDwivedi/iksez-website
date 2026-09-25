import Link from "next/link";
import { localizePath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/getDictionary";

// Next.js renders this (with a real 404 status) instead of the root
// app/(marketing)/[lang]/not-found.tsx when notFound() is called from this
// segment's page.tsx — the root one points back to "/", which would
// silently bounce a bad blog link instead of pointing at the blog itself.
export default async function BlogPostNotFound() {
  const lang = await getLocale();
  const { blog: t } = await getDictionary(lang);

  return (
    <section className="section text-center">
      <div className="container container--narrow">
        <span className="eyebrow" style={{ justifyContent: "center" }}>
          {t.notFound.eyebrow}
        </span>
        <h1 style={{ fontSize: "var(--fs-3xl)" }}>{t.notFound.title}</h1>
        <p className="lead">{t.notFound.lead}</p>
        <div className="flex mt-8" style={{ justifyContent: "center" }}>
          <Link className="btn btn--brand" href={localizePath("/blog/", lang)}>
            {t.backToBlog}
          </Link>
          <Link className="btn btn--outline" href={localizePath("/", lang)}>
            {t.notFound.home}
          </Link>
        </div>
      </div>
    </section>
  );
}
