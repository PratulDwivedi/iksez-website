import type { Metadata } from 'next';
import Script from 'next/script';
import './admin.css';

// This is its own Next.js root layout (its own <html>/<body>), separate from
// app/(marketing)/layout.tsx — see Next.js's "multiple root layouts" pattern
// (app/api-reference/file-conventions/route-groups). The admin console uses
// Tailwind CSS + class-based (.dark) dark mode, while the marketing site
// uses hand-rolled CSS + a data-theme attribute; sharing one <html> would
// mean both styling systems and both dark-mode mechanisms fighting over the
// same page.
export const metadata: Metadata = {
  // noindex covers every /admin/* route (login included, since this layout
  // sits above the (protected) route group) regardless of how a crawler
  // reached it — this is an internal tool, never meant to be indexed.
  robots: {
    index: false,
    follow: false,
  },
  // This layout doesn't inherit app/(marketing)/layout.tsx's metadata (it's
  // its own root layout), so the favicon has to be set here too.
  icons: { icon: '/images/logo.png' },
};

// Own storage key (iksez_admin_theme) so it can't collide with the marketing
// site's own theme choice (localStorage['theme'], data-theme attribute) —
// the two are unrelated preferences on two different styling systems.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem('iksez_admin_theme');
    var isDark = saved ? saved === 'dark' : true;
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="admin-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
