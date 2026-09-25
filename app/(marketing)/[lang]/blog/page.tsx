import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Search } from "lucide-react";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { TagFilter } from "@/components/blog/TagFilter";
import { getPublishedBlogCategories, getPublishedBlogList, getPublishedBlogTags } from "@/lib/publicBlogs";
import { getDictionary, getLocale, type Dictionary } from "@/lib/i18n/getDictionary";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";

export const dynamic = "force-dynamic";

// First-party call, same pattern as the admin console's own RPC calls: an
// explicit x-api-key resolves fn_get_website_blogs to IFFCO Kisan SEZ's own
// tenant (tenant_id=3) instead of requiring a third-party integrator's key.
// See /admin/settings ("Publishable API Key" card) to generate/reset it.
const FIRST_PARTY_API_KEY = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;

function buildHref(lang: Locale, params: { q?: string; category?: string; tags?: string[]; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category && params.category !== "All") sp.set("category", params.category);
  if (params.tags && params.tags.length > 0) sp.set("tags", params.tags.join(","));
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  const base = localizePath("/blog/", lang);
  return qs ? `${base}?${qs}` : base;
}

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; tags?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const lang = await getLocale();
  const { blog: t } = await getDictionary(lang);

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: localeAlternates("/blog/", lang),
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { q, category, tags, page } = await searchParams;
  const pageNum = Math.max(Number(page) || 1, 1);
  const activeCategory = category && category !== "All" ? category : "All";
  const activeTags = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const lang = await getLocale();
  const { blog: t } = await getDictionary(lang);

  return (
    <>
      <PageHero title={t.heroTitle} subtitle={t.heroSubtitle} banner="/images/media-banner.webp" />

      <section className="section">
        <div className="container">
          {/* No data-reveal here (unlike most other content blocks): that
              rule's `will-change: opacity, transform` creates a stacking
              context, which trapped the tag-filter dropdown's z-index
              below the card grid painted after it. */}
          <div className="blog-toolbar">
            <div className="blog-toolbar__row">
              <Suspense fallback={<div className="blog-cats-skel" />}>
                <CategoryTabs lang={lang} labels={t} active={activeCategory} query={q} tags={activeTags} />
              </Suspense>

              <Suspense fallback={<div className="blog-tagfilter-skel" />}>
                <TagFilterField labels={t.tagFilter} selectedTags={activeTags} />
              </Suspense>

              <form action={localizePath("/blog/", lang)} method="GET" className="blog-search">
                {activeCategory !== "All" && <input type="hidden" name="category" value={activeCategory} />}
                {activeTags.length > 0 && <input type="hidden" name="tags" value={activeTags.join(",")} />}
                <Search />
                <input type="text" name="q" defaultValue={q} placeholder={t.searchPlaceholder} />
              </form>
            </div>

            {activeTags.length > 0 && (
              <div className="blog-active-tags">
                {activeTags.map((tag) => (
                  <Link
                    key={tag}
                    href={buildHref(lang, { q, category: activeCategory, tags: activeTags.filter((x) => x !== tag) })}
                    className="chip"
                  >
                    {tag}
                    <svg viewBox="0 0 24 24">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <Suspense
              key={`${q ?? ""}|${activeCategory}|${activeTags.join(",")}|${pageNum}`}
              fallback={<BlogGridSkeleton />}
            >
              <BlogResults
                lang={lang}
                labels={t}
                query={q ?? ""}
                category={activeCategory}
                selectedTags={activeTags}
                page={pageNum}
              />
            </Suspense>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

async function CategoryTabs({
  lang,
  labels,
  active,
  query,
  tags,
}: {
  lang: Locale;
  labels: Dictionary["blog"];
  active: string;
  query?: string;
  tags: string[];
}) {
  const { data: categories } = await getPublishedBlogCategories(FIRST_PARTY_API_KEY);
  if (categories.length === 0) return null;

  const allCategories = ["All", ...categories];

  return (
    <div className="blog-cats">
      {allCategories.map((cat) => (
        <Link
          key={cat}
          href={buildHref(lang, { q: query, category: cat, tags })}
          className={`blog-cat${active === cat ? " is-active" : ""}`}
        >
          {/* "All" is the URL value; only its label is translated. Category
              names come from the backend (quick_lists) and stay as-is. */}
          {cat === "All" ? labels.allCategories : cat}
        </Link>
      ))}
    </div>
  );
}

async function TagFilterField({
  labels,
  selectedTags,
}: {
  labels: Dictionary["blog"]["tagFilter"];
  selectedTags: string[];
}) {
  const { data: allTags } = await getPublishedBlogTags(FIRST_PARTY_API_KEY);
  return <TagFilter allTags={allTags} selectedTags={selectedTags} labels={labels} />;
}

function BlogGridSkeleton() {
  return (
    <div className="blog-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="blog-skel-card">
          <div className="blog-skel-card__figure" />
          <div style={{ padding: "var(--sp-5)", display: "grid", gap: "var(--sp-3)" }}>
            <div className="blog-skel-line" style={{ width: "50%" }} />
            <div className="blog-skel-line" style={{ width: "100%" }} />
            <div className="blog-skel-line" style={{ width: "70%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

interface BlogResultsProps {
  lang: Locale;
  labels: Dictionary["blog"];
  query: string;
  category: string;
  selectedTags: string[];
  page: number;
}

async function BlogResults({ lang, labels, query, category, selectedTags, page }: BlogResultsProps) {
  const result = await getPublishedBlogList({
    search: query || undefined,
    category: category !== "All" ? category : undefined,
    tags: selectedTags,
    page,
    apiKey: FIRST_PARTY_API_KEY,
    locale: lang,
  });

  const { data: posts, paging, is_success, message } = result;
  const currentPage = paging.page_index || page;
  const totalPages = Math.max(Math.ceil(paging.total_records / (paging.page_size || 1)), 1);

  if (!is_success) {
    return <p className="blog-error">{message}</p>;
  }

  if (posts.length === 0) {
    return <p className="blog-empty">{labels.empty}</p>;
  }

  return (
    <>
      <div className="blog-grid">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} lang={lang} labels={labels} />
        ))}
      </div>

      <div className="mt-8">
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          buildHref={(p) => buildHref(lang, { q: query, category, tags: selectedTags, page: p })}
          labels={labels}
        />
      </div>
    </>
  );
}
