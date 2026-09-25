import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Inter, Noto_Sans_Telugu, Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteEffects from "@/components/SiteEffects";
import ThemeScript from "@/components/ThemeScript";
import WhatsAppButton from "@/components/WhatsAppButton";
import { PageviewTracker } from "@/components/PageviewTracker";
import { hasLocale, indexedLocales, localeTags, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { fallbackHeaderNav, headerNavFromTree } from "@/lib/headerNav";
import { getPublishedNav } from "@/lib/publicNav";
import { SITE_URL } from "@/lib/siteUrl";
import "../globals.css";

// Every marketing page lives under this [lang] segment, so each one is
// built once per locale from the same source file. English is served at the
// unprefixed URLs via a rewrite in proxy.ts (see lib/i18n/config.ts); any
// other value of [lang] is a 404 via the hasLocale check below. Deliberately
// not `dynamicParams = false` — that would also stop child segments (e.g.
// blog/[slug]) from rendering slugs published after the build.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return {
    // Resolves every page's relative canonical/hreflang/openGraph URL to the
    // canonical site origin (the same one sitemap.ts uses).
    metadataBase: new URL(SITE_URL),
    icons: { icon: "/images/logo.png" },
    // A locale that isn't fully translated yet stays out of search results
    // (see indexedLocales). Pages that set their own `robots` override this.
    robots: hasLocale(lang) && indexedLocales.includes(lang) ? undefined : { index: false, follow: true },
  };
}

// Self-hosted via next/font: fonts are downloaded at build time and served
// from this origin, so there's no render-blocking request out to
// fonts.googleapis.com/fonts.gstatic.com on every page load.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});

// Sits after Inter/Jakarta in the font stacks (theme.css), so Latin text
// keeps the brand fonts and only Telugu glyphs fall through to this one.
// Not preloaded: its @font-face is unicode-range scoped to Telugu, so
// English pages only fetch it for the few Telugu glyphs they show (the
// language switcher's "తెలుగు").
const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  display: "swap",
  preload: false,
  variable: "--font-telugu",
});

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, publishedNav] = await Promise.all([getDictionary(lang), getPublishedNav(lang)]);
  // Admin-managed menu (website_nav_items). If it can't be loaded, or has
  // nothing published yet, the site keeps its original built-in menu.
  const headerNav =
    publishedNav && publishedNav.tree.length > 0
      ? headerNavFromTree(publishedNav.tree, lang)
      : fallbackHeaderNav(dict.header.nav, lang);

  return (
    <html
      lang={localeTags[lang]}
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} ${notoSansTelugu.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <Suspense fallback={null}>
          <PageviewTracker />
        </Suspense>
        <a className="skip-link" href="#main">
          {dict.common.skipToContent}
        </a>
        <Header
          lang={lang}
          common={dict.common}
          labels={dict.header}
          nav={headerNav}
          switcherLabel={dict.languageSwitcher.ariaLabel}
        />
        <main id="main">{children}</main>
        <Footer lang={lang} common={dict.common} labels={dict.footer} />
        <SiteEffects />
        <WhatsAppButton />
      </body>
    </html>
  );
}
