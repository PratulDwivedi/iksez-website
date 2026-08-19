# IFFCO Kisan SEZ — Next.js site

Migrated from the previous static HTML/CSS/JS rebuild to Next.js (App
Router), keeping every page's content, images, navigation structure and URL
exactly as before. This was a **pure tech migration** — no redesign, no
content changes, no wording changes.

The site still ships as plain static HTML/CSS/JS (`next build` with
`output: 'export'`), because the client's hosting (IIS, see `web.config`) has
no Node.js runtime. Deploying is still "copy files to the server."

---

## 1. Local development

```bash
npm install
npm run dev          # http://localhost:3020
```

Routes are clean URLs (`/about-us/`) that work identically in `next dev` and
in the deployed static export — click through the site directly under
`npm run dev`, no build step needed for day-to-day work. To preview the
*exact* production artifact (including the legacy `.html` redirects, §3),
build and serve it instead:

```bash
npm run build         # writes the static site to out/, then runs postbuild
npm start               # serves out/ at http://localhost:3000
```

## 2. Deploying

```bash
npm run build
```

Upload the contents of `out/` to the web root — the same way the old static
site was deployed. No Node.js, no build step, no server process required on
the host.

## 3. URLs: clean now, old `.html` links still work

Every page's canonical URL is now a clean, trailing-slash path —
`/about-us/`, `/gallery/`, etc. — matching the App Router route
(`app/about-us/page.tsx`) exactly, in both `next dev` and the static export
(`trailingSlash: true` in `next.config.ts` makes the export write
`about-us/index.html`, served correctly by any static host with zero config).

The previous site's URLs (`/about-us.html`, …) may still be bookmarked,
backlinked, or indexed by search engines, so they keep working too:
`scripts/generate-legacy-redirects.mjs` runs after every build (`postbuild`
in package.json) and writes a small static redirect stub for each old
filename straight into `out/` — e.g. `out/about-us.html` instantly redirects
to `/about-us/` via `<meta http-equiv="refresh">` + a JS fallback. Add a new
page's legacy filename to that script's `LEGACY_ROUTES` map if you ever
rename a route.

## 4. Structure

```
app/
├── layout.tsx              Root layout — header, footer, fonts, global CSS
├── globals.css              @imports theme.css, base.css, components.css
├── theme.css / base.css / components.css   Design tokens, reset, components
├── page.tsx                 Home
├── not-found.tsx             404 (exported as 404.html automatically)
├── about-us/page.tsx
├── board-of-directors/page.tsx
├── agropark/page.tsx
├── tax/page.tsx
├── strategic/page.tsx
├── invitation-for-investors/page.tsx
├── industrial/page.tsx
├── master-plan/page.tsx
├── existing-units/page.tsx
├── news-and-events/page.tsx
├── gallery/page.tsx
└── contact-us/page.tsx

components/
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

scripts/
└── generate-legacy-redirects.mjs   Writes the old *.html redirect stubs
                                      into out/ after every build — see §3
```

`data-reveal`, `data-count`, `data-lightbox`, `data-caption` etc. are the
same markup hooks as before — `SiteEffects.tsx` wires them up the same way
`main.js` did, adapted for React's lifecycle instead of a full page reload.

## 5. Theming — light & dark mode

Colors live in `app/theme.css` as OKLCH custom properties, in two layers:

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
in `app/gallery/page.tsx`) — preserved as-is rather than "fixed", since
fixing content wasn't in scope.
