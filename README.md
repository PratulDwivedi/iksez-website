# IFFCO Kisan SEZ — Next.js site

Migrated from the previous static HTML/CSS/JS rebuild to Next.js (App
Router), keeping every page's content, images, navigation structure and URL
exactly as before. This was a **pure tech migration** — no redesign, no
content changes, no wording changes.

The public marketing pages (originally under `app/`, now `app/(marketing)/`
— a route group, doesn't affect URLs) still render as plain static content,
same as the old IIS static export described below. But the site as a whole
now runs as a Next.js server on Vercel (`.vercel/`, `vercel.json`), not a
static export: `app/admin/` is a Supabase-backed admin console (Server
Actions, cookie-based auth via `proxy.ts`) and `app/api/` are dynamic route
handlers, neither of which can run under `output: 'export'`. `web.config`
and the old "copy files to IIS" flow no longer apply.

---

## 1. Local development

```bash
npm install
npm run dev          # http://localhost:3020
```

The admin console (`/admin`) needs Supabase env vars — copy `.env.example`
to `.env.local` (untracked) and fill in the values (ask a teammate, or see
Vercel's project env vars) before running `npm run dev`. Public marketing
routes work without any env vars.

Routes are clean URLs (`/about-us/`) — `trailingSlash: true` in
`next.config.ts` keeps that both in `next dev` and in production. To preview
the exact production build (including the legacy `.html` → clean-URL
redirects, §3, now real 308s via `next.config.ts`'s `redirects()`):

```bash
npm run build
npm start               # next start, http://localhost:3000
```

## 2. Deploying

Deploys to Vercel (already linked — see `.vercel/project.json`):

```bash
vercel --prod
```

or push to the connected Git branch. Admin needs `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_BLOG_COVER_BASE_URL`
set as Vercel project env vars (see `.env.local` for the current values —
same Supabase project as the other tenant sites, IFFCO Kisan SEZ is
`tenant_id = 3` there).

## 3. URLs: clean now, old `.html` links still work

Every page's canonical URL is a clean, trailing-slash path — `/about-us/`,
`/gallery/`, etc. — matching the App Router route
(`app/(marketing)/about-us/page.tsx`) exactly (`trailingSlash: true` in
`next.config.ts`).

The previous static site's URLs (`/about-us.html`, …) may still be
bookmarked, backlinked, or indexed by search engines, so they keep working
too: `next.config.ts`'s `redirects()` 308-redirects each old filename to its
clean-URL equivalent (e.g. `/about-us.html` → `/about-us/`). Add a new page's
legacy filename to that `LEGACY_ROUTES` map if you ever rename a route.

## 4. Structure

```
app/
├── (marketing)/            Route group — public site, its own root layout
│   ├── layout.tsx            Header, footer, fonts, global CSS
│   ├── globals.css            @imports theme.css, base.css, components.css
│   ├── theme.css / base.css / components.css
│   ├── page.tsx               Home
│   ├── not-found.tsx          404
│   └── about-us/, agropark/, tax/, strategic/,
│       invitation-for-investors/, industrial/, master-plan/,
│       existing-units/, news-and-events/, gallery/,
│       contact-us/, board-of-directors/   One page.tsx each
│
├── admin/                  Supabase-backed admin console — its OWN root
│   │                         layout (own <html>, Tailwind CSS, class-based
│   │                         dark mode), NOT under (marketing)
│   ├── layout.tsx             Root layout + admin.css (Tailwind) + theme-init
│   ├── admin.css               @import "tailwindcss"; brand tokens
│   ├── login/page.tsx
│   └── (protected)/           Auth-gated via proxy.ts + this layout's own
│       ├── layout.tsx           fn_get_profile()/fn_is_admin() check
│       └── dashboard/, blogs/, testimonials/, leads/, tickets/,
│           media/, profile/, settings/   page.tsx (+ actions.ts
│           Server Actions where the page writes data)
│
└── api/                    Public REST API (x-api-key auth) backing the
    └── blogs/, tickets/, testimonials/, leads/, analytics/, media/
                               same Supabase RPCs the admin console uses

proxy.ts                   Next.js 16 proxy (formerly middleware.ts) —
                              refreshes the Supabase session cookie and
                              redirects unauthenticated /admin/* requests to
                              /admin/login/

lib/, lib/supabase/, context/, hooks/   Admin/API data layer — Supabase
                                           clients, RPC helper, tenant-scoped
                                           queries, shared React state

components/
├── admin/                  Admin-only components (Tailwind), separate from
│                             the marketing components below
├── Header.tsx        Sticky nav, mobile drawer, active-link highlighting
├── Footer.tsx / FooterYear.tsx
├── PageHero.tsx        Inner-page banner + breadcrumb
├── CtaBand.tsx          Closing call-to-action
├── HeroSlider.tsx        Homepage image slider
├── ContactForm.tsx        mailto: form (no backend, same as before)
├── SiteEffects.tsx        Scroll reveal, animated counters, accordion,
│                            lightbox, back-to-top — ported from the old
│                            assets/js/main.js
├── ThemeScript.tsx        Blocking pre-paint script — applies the stored/
│                            system theme before first paint (no flash)
└── ThemeToggle.tsx        Header sun/moon button; persists choice to
                             localStorage

public/
├── images/            Same files, same paths, as the old images/ folder
└── admin/upload/       Same files, same paths (used by the Image Gallery)
```

`data-reveal`, `data-count`, `data-lightbox`, `data-caption` etc. are the
same markup hooks as before — `SiteEffects.tsx` wires them up the same way
`main.js` did, adapted for React's lifecycle instead of a full page reload.

Why `app/admin/` sits outside `app/(marketing)/`: Next.js only allows one
`<html>`/`<body>` per "root layout" segment tree ("multiple root layouts",
see the App Router route-groups docs) — admin needs its own because it uses
Tailwind CSS and class-based (`.dark`) dark mode, while the marketing site
uses hand-rolled CSS and a `data-theme` attribute. Sharing one `<html>` would
mean both styling systems and both dark-mode mechanisms fighting over the
same page. Navigating between the two triggers a full page reload (expected
for multiple root layouts) — acceptable since admin and marketing are
effectively two different apps sharing one deploy.

## 5. Theming — light & dark mode

Colors live in `app/(marketing)/theme.css` as OKLCH custom properties, in two layers:

- **Scale tokens** (`--color-primary-*`, `--color-secondary-*`, `--color-accent`,
  `--color-neutral-*`) — the brand palette. `primary`/`secondary`/`accent`
  are the exact IKSEZ indigo/green/gold, converted 1:1 from the original hex
  values to OKLCH (same colors, just a different color function), and stay
  **identical between light and dark mode** — buttons, gradients and badges
  keep their full brand vividness in both themes. The `neutral` scale
  *does* change: its ten steps invert in dark mode (same variable names,
  dark-tuned values), so every consumer — body text, borders, subtle tints —
  adapts automatically without touching component CSS.
- **Semantic tokens** (`--color-bg`, `--color-surface`, `--color-text`,
  `--color-heading`, `--color-muted`, `--color-border`, `--color-link`, …) —
  what components actually reference. These are redefined per theme (light
  on bare `:root`; dark under `@media (prefers-color-scheme: dark)` and
  `:root[data-theme="dark"]`) and are what makes the toggle work. Chrome
  that was always meant to be dark regardless of site theme — the footer,
  the page-hero banner, the CTA band — intentionally stays on the fixed
  scale tokens, not the semantic ones, since it doesn't need to change.

**Switching themes:** the header's sun/moon button (`ThemeToggle.tsx`) sets
`data-theme="light"` / `"dark"` on `<html>` and persists it to
`localStorage`; with nothing stored, the OS/browser preference decides.
`ThemeScript.tsx` is a blocking script in `<head>` that applies whatever was
stored *before* the page paints, so there's no flash of the wrong theme on
load.

## 6. Content

Body copy, headings, stats, captions and images are unchanged from the
previous site. A handful of Image Gallery entries reference files that were
already missing from `admin/upload` before this migration (see the comment
in `app/(marketing)/gallery/page.tsx`) — preserved as-is rather than "fixed", since
fixing content wasn't in scope.
