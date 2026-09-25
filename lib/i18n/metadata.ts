import type { Metadata } from "next";
import { defaultLocale, indexedLocales, localeTags, localizePath, type Locale } from "./config";

// canonical + hreflang alternates for a locale-neutral path ("/blog/"), in
// the shape generateMetadata's `alternates` expects. Relative URLs are
// resolved against metadataBase (set in the [lang] layout).
//
// Each locale's page is canonical to itself — never canonicalize /te/x/ to
// /x/, that tells Google the Telugu page is a duplicate and drops it. Only
// indexed locales are advertised as hreflang alternates (see
// indexedLocales in ./config), and x-default points at the English URL.
export function localeAlternates(path: string, locale: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of indexedLocales) languages[localeTags[l]] = localizePath(path, l);
  languages["x-default"] = localizePath(path, defaultLocale);

  return {
    canonical: localizePath(path, locale),
    languages,
  };
}
