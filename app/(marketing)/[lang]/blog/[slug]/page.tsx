import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import CtaBand from "@/components/CtaBand";
import { PostBody } from "@/components/blog/PostBody";
import { ShareButton } from "@/components/blog/ShareButton";
import { getPublishedBlogBySlug, getPublishedBlogList } from "@/lib/publicBlogs";
import { formatBlogDate, blogReadTime } from "@/lib/blogDisplay";
import { getDictionary, getLocale } from "@/lib/i18n/getDictionary";
import { localizePath } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";

// Individual posts have no per-request dynamic input (no searchParams —
// unlike /blog's list page, which needs force-dynamic for its search/tag
// filters). generateStaticParams below pre-renders every known slug at
// build time; a newly published slug not yet in that list still renders
// on-demand on first request (dynamicParams defaults to true) and is
// cached from then on — see saveBlogPost's revalidatePath call in
// app/admin/(protected)/blogs/actions.ts.
export const revalidate = 3600;

const FIRST_PARTY_API_KEY = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data } = await getPublishedBlogList({ apiKey: FIRST_PARTY_API_KEY, pageSize: 1000 });
  return data.map((post) => ({ slug: post.name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLocale();
  const { data: post } = await getPublishedBlogBySlug(slug, FIRST_PARTY_API_KEY, lang);

  if (!post) {
    const { blog: t } = await getDictionary(lang);
    return { title: t.articleNotFoundMetaTitle };
  }

  const path = `/blog/${post.name}/`;

  return {
    title: `${post.title} | IFFCO Kisan SEZ`,
    description: post.excerpt,
    // An untranslated post on /te/blog/x/ is the English article verbatim, so
    // it's canonical to the English URL rather than competing with it as a
    // duplicate, and advertises no hreflang alternates of its own.
    alternates: post.is_fallback ? { canonical: path } : localeAlternates(path, lang),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: localizePath(path, lang),
      type: "article",
      images: [{ url: post.cover_url, alt: post.cover_alt || post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const lang = await getLocale();
  const [{ data: post }, { blog: t }] = await Promise.all([
    getPublishedBlogBySlug(slug, FIRST_PARTY_API_KEY, lang),
    getDictionary(lang),
  ]);

  if (!post) {
    notFound();
  }

  const faqs = post.data?.faqs;
  // The post's own text is English when it has no translation for this
  // locale; the surrounding UI stays in the page's language.
  const contentLang = post.is_fallback ? "en" : undefined;

  return (
    <>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container container--narrow">
          <Link href={localizePath("/blog/", lang)} className="blog-post__back">
            <ArrowLeft /> {t.backToBlog}
          </Link>

          {post.is_fallback && (
            <p className="blog-post__lang-notice" role="note">
              {t.englishOnlyNotice}
            </p>
          )}

          <div className="blog-post__head">
            <div className="blog-post__meta-top">
              <span className="chip chip--green">{post.category}</span>
              <span className="blog-post__readtime">
                <Clock /> {blogReadTime(post.read_minutes, t.readTime)}
              </span>
            </div>

            <h1 className="blog-post__title" lang={contentLang}>
              {post.title}
            </h1>

            <div className="blog-post__meta">
              <div className="blog-post__by">
                <strong>
                  <User /> {post.author_name}
                </strong>
                <span style={{ display: "inline-flex", alignItems: "center", gap: ".4rem" }}>
                  <Calendar size={15} />
                  {formatBlogDate(post.published_at, lang)}
                </span>
              </div>
              <ShareButton labels={t} />
            </div>
          </div>

          <div className="blog-post__cover">
            <Image src={post.cover_url} alt={post.cover_alt || post.title} fill sizes="(min-width: 900px) 900px, 100vw" priority />
          </div>

          <div lang={contentLang}>
            <PostBody blocks={post.body} />
          </div>

          {post.tags.length > 0 && (
            <div className="blog-post__tags">
              {post.tags.map((tag) => (
                <span key={tag} className="chip">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {faqs && faqs.length > 0 && (
            <div className="blog-post__faqs" lang={contentLang}>
              <h2>{t.faqTitle}</h2>
              <div className="accordion">
                {faqs.map((faq, index) => {
                  const panelId = `blog-faq-${index}`;
                  return (
                    <div className="accordion__item" key={panelId}>
                      <h3 style={{ margin: 0 }}>
                        <button
                          className="accordion__btn"
                          type="button"
                          aria-expanded={index === 0}
                          aria-controls={panelId}
                        >
                          {faq.question}
                        </button>
                      </h3>
                      <div className={`accordion__panel${index === 0 ? " is-open" : ""}`} id={panelId}>
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-8" style={{ marginTop: "var(--sp-9)" }}>
        <CtaBand />
      </div>
    </>
  );
}
