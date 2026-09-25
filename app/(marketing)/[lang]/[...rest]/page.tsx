import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ExternalLink, FileText } from "lucide-react";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import { getDictionary, getLocale } from "@/lib/i18n/getDictionary";
// import { localizePath } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { getPublishedNav } from "@/lib/publicNav";
import { documentFileUrl, navItemHref, navItemNeedsAnchor, type NavNode } from "@/lib/navTree";
import { isBlankHtml, sanitizePageHtml } from "@/lib/sanitizePageHtml";

// Every path under a locale that no coded route matches lands here. Paths
// that match a published website_nav_items entry are CMS content:
//   page      → its body and a listing of its children
//   document  → a redirect to the PDF (the visitor's language, if uploaded)
// Anything else is a 404, rendered by [lang]/not-found.tsx inside the site
// layout and in the visitor's language rather than Next.js's bare default.
//
// Rendered on first request and cached; the admin navigation actions
// revalidate the whole [lang] layout on every change, the hour is a safety
// net.
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

async function resolveItem(rest: string[]) {
  const lang = await getLocale();
  const nav = await getPublishedNav(lang);
  const node = nav?.byPath.get(rest.join("/"));
  return { lang, nav, node };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[...rest]">): Promise<Metadata> {
  const { rest } = await params;
  const { lang, node } = await resolveItem(rest);
  if (!node || node.kind !== "page") return {};

  const path = `/${node.path}/`;
  return {
    title: `${node.title} | IFFCO Kisan SEZ`,
    description: node.description ?? undefined,
    // An untranslated page on /te/... is the English page verbatim, so it's
    // canonical to the English URL (same rule as untranslated blog posts).
    alternates: node.is_fallback ? { canonical: path } : localeAlternates(path, lang),
  };
}

export default async function CmsPage({ params }: PageProps<"/[lang]/[...rest]">) {
  const { rest } = await params;
  const { lang, nav, node } = await resolveItem(rest);
  if (!nav || !node || node.kind === "link") notFound();

  if (node.kind === "document") {
    if (!node.file_path) notFound();
    redirect(documentFileUrl(node.file_path));
  }

  const { cmsPage: t } = await getDictionary(lang);
  const body = isBlankHtml(node.body_html) ? "" : sanitizePageHtml(node.body_html, lang);
  const documents = node.children.filter((child) => child.kind === "document");
  const sections = node.children.filter((child) => child.kind !== "document");
  const contentLang = node.is_fallback ? "en" : undefined;

  // Breadcrumb turned off for now: no other page of the site has one. To
  // bring it back, uncomment this and pass breadcrumbs={breadcrumbs} to
  // PageHero below (it already supports it), plus the localizePath import.
  //
  // // Home / ancestors / this page, from the path's prefixes. Only page
  // // ancestors are linked; a link item has no page of its own.
  // const segments = node.path.split("/");
  // const ancestors = segments
  //   .slice(0, -1)
  //   .map((_, i) => nav.byPath.get(segments.slice(0, i + 1).join("/")))
  //   .filter((ancestor): ancestor is NavNode => Boolean(ancestor));
  // const breadcrumbs = [
  //   { label: t.home, href: localizePath("/", lang) },
  //   ...ancestors.map((ancestor) => ({
  //     label: ancestor.title,
  //     href: ancestor.kind === "page" ? navItemHref(ancestor, lang) : undefined,
  //   })),
  //   { label: node.title },
  // ];

  return (
    <>
      <PageHero title={node.title} subtitle={node.description ?? undefined} />
      {/* A page with no body and no sub-items is just its hero. */}
      {(node.is_fallback || body || node.children.length > 0) && (
        <section className="section">
          <div className="container container--narrow">
            {node.is_fallback && (
              <p className="blog-post__lang-notice" role="note">
                {t.englishOnlyNotice}
              </p>
            )}

            {body && (
              <div className="cms-body blog-post-body" lang={contentLang} dangerouslySetInnerHTML={{ __html: body }} />
            )}

            {sections.length > 0 && (
              <div className="cms-block">
                {(body || documents.length > 0) && <h2 className="cms-block__title">{t.sections}</h2>}
                <div className="grid grid--3">
                  {sections.map((section) => (
                    <SectionCard key={section.id} item={section} lang={lang} openLabel={t.openSection} />
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div className="cms-block">
                {(body || sections.length > 0) && <h2 className="cms-block__title">{t.documents}</h2>}
                <div className="compliance-list">
                  {documents.map((document) => (
                    <article className="compliance-item" key={document.id}>
                      <div className="compliance-item__icon" aria-hidden="true">
                        <FileText />
                      </div>
                      <div className="compliance-item__body">
                        <span className="compliance-item__meta">
                          {document.file_is_fallback ? t.englishPdf : t.pdf}
                        </span>
                        <h3 lang={document.is_fallback ? "en" : undefined}>{document.title}</h3>
                        {document.description && (
                          <p lang={document.is_fallback ? "en" : undefined}>{document.description}</p>
                        )}
                        <div className="compliance-item__actions">
                          <a
                            className="btn btn--brand btn--sm"
                            href={navItemHref(document, lang)}
                            target={document.open_in_new_tab ? "_blank" : undefined}
                            rel={document.open_in_new_tab ? "noopener" : undefined}
                          >
                            <ExternalLink /> {t.viewPdf}
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}

function SectionCard({ item, lang, openLabel }: { item: NavNode; lang: Parameters<typeof navItemHref>[1]; openLabel: string }) {
  const href = navItemHref(item, lang);
  const content = (
    <>
      <div className="card__icon">
        <FileText />
      </div>
      <h3 lang={item.is_fallback ? "en" : undefined}>{item.title}</h3>
      {item.description && <p lang={item.is_fallback ? "en" : undefined}>{item.description}</p>}
      <span className="cms-card__more">
        {openLabel} <ArrowRight />
      </span>
    </>
  );
  return navItemNeedsAnchor(item) ? (
    <a
      className="card card--flat cms-card"
      href={href}
      target={item.open_in_new_tab ? "_blank" : undefined}
      rel={item.open_in_new_tab ? "noopener" : undefined}
    >
      {content}
    </a>
  ) : (
    <Link className="card card--flat cms-card" href={href}>
      {content}
    </Link>
  );
}
