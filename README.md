# IFFCO Kisan SEZ — static site rebuild

Pure HTML / CSS / vanilla JS. No build step, no `node_modules`, no server-side
code. Upload the folder to any static host (cPanel, Apache, Nginx, IIS, S3,
Netlify, GitHub Pages) and it runs.

---

## 1. Before you deploy — copy the images across

The image and PDF files were **not** touched by this rebuild. The new pages
reference them at exactly the same paths as the old site, so:

```
copy  <old site>/images/        →  iksez/images/
copy  <old site>/admin/upload/  →  iksez/admin/upload/
```

That's the only manual step. Files referenced (all pre-existing):

| Folder | Used for |
|---|---|
| `images/logo.png` | header, footer, favicon |
| `images/1.png` … `6.png` | homepage hero slider |
| `images/img1.png`, `inner-image1.jpg` | About |
| `images/agropark-image.jpg`, `components.jpg` | Agropark |
| `images/water-1.jpg`, `pump-house.jpg`, `power-station.jpg`, `security.jpg`, `internal-road.jpg`, `Peripheral-Roads.jpg`, `ready-space.jpg`, `hall.jpg` | Infrastructure |
| `images/map-iksez.png` | Master Plan |
| `images/existing-1.jpg`, `existing-2.png` | Existing units |
| `images/medical-*.jpg`, `camp-*.jpg`, `new-*.jpg`, `district-*.jpg`, `Layer 1-8.png` | News and Events |
| `images/board-of-directors/rakesh2.jpg` | Management Team |
| `images/*-banner.png` | page banners |
| `images/EC-Compliance-Report-2025.pdf`, `iksez-EC-complains-enviroment.pdf` | EC compliance menu |
| `admin/upload/*` | Image Gallery |

---

## 2. Local preview

The header/footer are loaded with `fetch()`, which browsers block on
`file://`. Serve over http:

```bash
python3 -m http.server 8080      # then open http://localhost:8080
# or
npx serve .
```

Opening `index.html` by double-clicking will show a red "could not load"
notice where the header should be. That is expected — it works once served.

---

## 3. Structure

```
iksez/
├── index.html                     Home
├── about-us.html                  About us
├── board-of-directors.html        Management Team
├── agropark.html                  Agropark
├── tax.html                       Benefits → Tax
├── strategic.html                 Benefits → Strategic
├── invitation-for-investors.html  Business Opportunities
├── industrial.html                Infrastructure
├── master-plan.html               Master Plan
├── existing-units.html            Existing units
├── news-and-events.html           Media → News and Events   (was .php)
├── gallery.html                   Media → Image Gallery     (was .php)
├── contact-us.html                Contact us
├── 404.html
├── components.html                Living style guide / component reference
├── .htaccess                      301s from the old .php URLs, caching, gzip
│
├── components/                    ← shared, edit once
│   ├── header.html                top bar + sticky nav + mobile drawer
│   ├── footer.html                4-column footer
│   ├── page-hero.html             inner-page banner (parameterised)
│   └── cta-band.html              closing call-to-action
│
├── assets/css/
│   ├── theme.css                  design tokens — colours, type, spacing
│   ├── base.css                   reset, layout primitives, utilities
│   └── components.css             the component library
│
└── assets/js/
    ├── include.js                 the partial loader (~90 lines)
    └── main.js                    nav, slider, reveal, counters,
                                   accordion, lightbox, back-to-top
```

---

## 4. How the components work

Drop a placeholder anywhere; it is replaced by the partial's markup:

```html
<div data-include="components/header.html"></div>
```

Partials can take parameters via `data-*` attributes, substituted into
`{{token}}` placeholders in both text and attributes:

```html
<div data-include="components/page-hero.html"
     data-title="About us"
     data-subtitle="Optional one-liner"
     data-banner="images/about-us-banner.png"></div>
```

An element marked `data-if="subtitle"` is removed when that parameter is
absent, so optional bits disappear cleanly.

Nested includes work — a partial may itself contain `data-include`.
When everything has resolved, `include.js` fires `components:loaded` on
`document`; `main.js` waits for that before wiring up behaviour.

**Adding a menu item** → edit `components/header.html` once. Every page
picks it up. The active item highlights itself from the URL, so there is
nothing per-page to maintain.

---

## 5. Re-theming

Everything visual keys off CSS variables in `assets/css/theme.css`.
Change these four and the whole site follows:

```css
--brand-indigo: #2e3192;   /* logo diamond */
--brand-green:  #009b48;   /* logo leaf */
--brand-gold:   #d9a441;   /* sparing accent */
--font-display: "Plus Jakarta Sans", ...;
```

The palette was sampled from the IKSEZ logo — indigo `#2e3192` for the
diamond, green `#009b48` for the leaf, with tints and shades derived from
each. Gradients (`--grad-brand`, `--grad-deep`, `--grad-rule`) run indigo →
green, echoing the mark.

Open `components.html` in a browser for a live catalogue of every component
with its markup.

---

## 6. Behaviour reference

| Feature | Markup hook |
|---|---|
| Scroll reveal | `data-reveal` on any element (auto-staggered by sibling order) |
| Animated number | `<span data-count="1900" data-suffix=" km">` |
| Lightbox | `<a href="big.jpg" data-lightbox data-caption="…">` — arrows + Esc work |
| Accordion | `.accordion` wrapper; add `data-single="true"` to close others |
| Hero slider | `.hero__slide` children of `.hero__slides`; dots auto-generated |
| Footer year | `<span data-year>` |

All of it degrades gracefully — with JS disabled the content is still
readable, though the header/footer will not render (they are fetched).
If that matters for SEO, see §7.

---

## 7. If you'd rather not fetch the header/footer

Two options, both still node-free:

1. **Server-side include** — if the host runs Apache with `mod_include`,
   rename pages to `.shtml` and use `<!--#include virtual="components/header.html" -->`.
   Zero JS, fully crawlable.
2. **Paste it in** — copy the contents of `components/header.html` and
   `footer.html` into each page. You lose edit-once, gain full static HTML.

Search engines do execute JavaScript, so the current approach indexes fine
in practice; option 1 is the belt-and-braces choice.

---

## 8. Contact form

`contact-us.html` has no backend. By default it composes a message in the
visitor's mail client addressed to `ceooffice@iffcosez.in`.

To post it properly instead, give the form an `action` and `method` — the
inline script stands down automatically when an `action` is present:

```html
<form id="contact-form" action="https://formspree.io/f/XXXX" method="POST">
```

---

## 9. Content

Body copy, headings, vision, mission, facts, figures and captions are carried
over verbatim from iksez.com. No wording was rewritten and no images were
replaced. The only text that is new is navigation labels, section eyebrows
and button labels — presentation chrome, not content. Every figure shown in
a stat block (1,900 acres, 877 acres, 2,776.23 acres, 8 km frontage, 220 kV,
100 MW, 45 MLD, 79 acres, 27 km, 60 km) appears in the original site copy.



Prompt:
migrate below website with new advance looks, having logo color theme as attached, keep the content image, vision , facts . strict no change on that, wanted to have reusable component and app should be deploy as pure html/css/css because client hosting is like that, can afford node module hosting, ask me any clarification if required.