import type { NextConfig } from "next";

/**
 * Runs as a normal Next.js server on Vercel (not a static export) so the
 * admin console (Server Actions, Supabase session cookies, dynamic route
 * handlers under app/api/) can work — none of those run under
 * `output: 'export'`. The public marketing pages are unaffected: they were
 * already plain Server Components with no dynamic behavior, so they render
 * identically either way.
 *
 * trailingSlash: true keeps the clean canonical URLs (/about-us/) the site
 * already shipped with under the old static export.
 */
const nextConfig: NextConfig = {
  trailingSlash: true,

  images: {
    // Admin-only: blog cover images and media library thumbnails are stored
    // in this Supabase project's Storage buckets and rendered via next/image.
    remotePatterns: [
      { protocol: "https", hostname: "wirkzblhhfrqbywrtoze.supabase.co", pathname: "/storage/v1/object/**" },
    ],
  },

  async redirects() {
    // The previous static site's *.html URLs may still be bookmarked,
    // backlinked, or indexed by search engines. Previously handled by
    // scripts/generate-legacy-redirects.mjs writing meta-refresh stubs into
    // out/ after build (required under static export, no server to redirect
    // with); now a real 308 redirect since we have one.
    const LEGACY_ROUTES: Record<string, string> = {
      "/about-us.html": "/about-us/",
      "/strategic/": "/benefits/",
      "/tax/": "/benefits/",
      "/board-of-directors.html": "/board-of-directors/",
      "/agropark.html": "/agropark/",
      "/tax.html": "/benefits/",
      "/strategic.html": "/strategic/",
      "/invitation-for-investors.html": "/invitation-for-investors/",
      "/industrial.html": "/industrial/",
      "/master-plan.html": "/master-plan/",
      "/existing-units.html": "/existing-units/",
      "/news-and-events.html": "/news-and-events/",
      "/gallery.html": "/gallery/",
      "/contact-us.html": "/contact-us/",
    };

    // Compliances moved from a coded page (and PDFs in public/images) into
    // the admin-managed Reports & Policies section (website_nav_items).
    // The two PDFs' paths below are their document items there, which
    // redirect on to the uploaded file.
    const COMPLIANCE_ROUTES: Record<string, string> = {
      "/compliances/ec-compliance-report-2025/": "/reports-policies/compliances/ec-compliance-report/",
      "/compliances/environment-clearance/": "/reports-policies/compliances/environment-clearance/",
      "/compliances/": "/reports-policies/compliances/",
      "/te/compliances/ec-compliance-report-2025/": "/te/reports-policies/compliances/ec-compliance-report/",
      "/te/compliances/environment-clearance/": "/te/reports-policies/compliances/environment-clearance/",
      "/te/compliances/": "/te/reports-policies/compliances/",
      "/images/EC-Compliance-Report-2025.pdf": "/reports-policies/compliances/ec-compliance-report/",
      "/images/iksez-EC-complains-enviroment.pdf": "/reports-policies/compliances/environment-clearance/",
    };

    return Object.entries({ ...LEGACY_ROUTES, ...COMPLIANCE_ROUTES }).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
