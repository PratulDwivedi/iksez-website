"use client";

import { usePathname } from "next/navigation";
import {
  LOCALE_COOKIE,
  localeLabels,
  locales,
  localizePath,
  stripLocale,
  type Locale,
} from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  ariaLabel: string;
};

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

// Plain links to the same page in each locale (/about-us/ <-> /te/about-us/)
// rather than a JS toggle, so every language version is crawlable and
// shareable. Deliberately <a>, not next/link: switching language swaps the
// [lang] root layout (<html lang>, fonts, ThemeScript), which should be a
// full document load rather than a client-side re-render of <html>. Clicking also remembers the choice in a cookie, which proxy.ts
// only consults when someone lands on "/" — see LOCALE_COOKIE.
export default function LanguageSwitcher({ lang, ariaLabel }: Props) {
  // usePathname() is the public URL (before proxy.ts's rewrite), so it's
  // already "/about-us/" for English and "/te/about-us/" for Telugu.
  const pathname = usePathname();
  const basePath = stripLocale(pathname);

  return (
    <nav className="topbar__languages" aria-label={ariaLabel}>
      {locales.map((locale) =>
        locale === lang ? (
          <span key={locale} className="is-active" lang={locale} aria-current="true">
            {localeLabels[locale].native}
          </span>
        ) : (
          <a
            key={locale}
            href={localizePath(basePath, locale)}
            hrefLang={locale}
            lang={locale}
            onClick={() => rememberLocale(locale)}
          >
            {localeLabels[locale].native}
          </a>
        ),
      )}
    </nav>
  );
}
