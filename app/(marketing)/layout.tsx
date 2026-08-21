import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteEffects from "@/components/SiteEffects";
import ThemeScript from "@/components/ThemeScript";
import WhatsAppButton from "@/components/WhatsAppButton";
import { PageviewTracker } from "@/components/PageviewTracker";
import "./globals.css";

export const metadata: Metadata = {
  icons: { icon: "/images/logo.png" },
};

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Suspense fallback={null}>
          <PageviewTracker />
        </Suspense>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <SiteEffects />
        <WhatsAppButton />
      </body>
    </html>
  );
}
