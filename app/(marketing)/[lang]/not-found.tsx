import Link from "next/link";
import { localizePath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/getDictionary";

export default async function NotFound() {
  const lang = await getLocale();
  const { notFound: t } = await getDictionary(lang);

  return (
    <section className="section text-center">
      <div className="container container--narrow">
        <span className="eyebrow" style={{ justifyContent: "center" }}>
          {t.eyebrow}
        </span>
        <h1 style={{ fontSize: "var(--fs-3xl)" }}>{t.title}</h1>
        <p className="lead">{t.lead}</p>
        <div className="flex mt-8" style={{ justifyContent: "center" }}>
          <Link className="btn btn--brand" href={localizePath("/", lang)}>
            {t.home}
          </Link>
          <Link className="btn btn--outline" href={localizePath("/contact-us/", lang)}>
            {t.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}
