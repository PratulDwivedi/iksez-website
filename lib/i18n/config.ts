// Locale config + path helpers shared by proxy.ts, server components and
// client components alike — so nothing in here may import server-only code
// (next/root-params, dictionaries, etc.).
//
// URL scheme ("option B"): English is the default and keeps the site's
// existing unprefixed URLs (/about-us/), every other locale is prefixed
// (/te/about-us/). Internally every marketing route lives under
// app/(marketing)/[lang]/ — proxy.ts rewrites unprefixed requests to
// /en/... so English visitors (and search engines) never see the prefix.

export const locales = ["en", "te"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Locales search engines may index. A locale stays out of this list — its
// pages get robots noindex, and it's left out of hreflang/sitemap — until
// its translations are complete enough that indexing it wouldn't just
// surface English copy under a Telugu URL. Add "te" here once phase 2
// (translating the static pages) is done.
export const indexedLocales: readonly Locale[] = ["en"];

// Cookie remembering the visitor's explicit choice from the language
// switcher. Only consulted on "/" (see proxy.ts) — never used to redirect
// inner pages, so a shared /about-us/ link always opens in English.
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeLabels: Record<Locale, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  te: { native: "తెలుగు", english: "Telugu" },
};

// BCP 47 tags for <html lang>, hreflang and Intl formatting.
export const localeTags: Record<Locale, string> = {
  en: "en-IN",
  te: "te-IN",
};

export function hasLocale(value: string | undefined): value is Locale {
  return (locales as readonly string[]).includes(value ?? "");
}

// The locale a public URL is in, from its first path segment.
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return hasLocale(first) && first !== defaultLocale ? first : defaultLocale;
}

// "/te/about-us/" -> "/about-us/", "/te/" -> "/", "/about-us/" -> "/about-us/".
export function stripLocale(pathname: string): string {
  const first = pathname.split("/")[1];
  if (!hasLocale(first)) return pathname;
  const rest = pathname.slice(first.length + 1);
  return rest.startsWith("/") ? rest : `/${rest}`;
}

// Public URL of a locale-neutral path ("/about-us/") in the given locale.
// Leaves external URLs, hash/query-only hrefs and non-marketing paths
// (/admin, /api) untouched.
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (path.startsWith("/admin") || path.startsWith("/api")) return path;
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}
