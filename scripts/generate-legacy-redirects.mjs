// Runs after `next build` (see package.json "build" script). The site's
// canonical URLs are now clean (/about-us/), but the previous static site's
// *.html URLs may be bookmarked, backlinked, or indexed by search engines —
// this writes a tiny static redirect stub for each old filename into out/,
// so those old links keep working with zero server config on the IIS host.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "out");

const LEGACY_ROUTES = {
  "about-us.html": "/about-us/",
  "board-of-directors.html": "/board-of-directors/",
  "agropark.html": "/agropark/",
  "tax.html": "/tax/",
  "strategic.html": "/strategic/",
  "invitation-for-investors.html": "/invitation-for-investors/",
  "industrial.html": "/industrial/",
  "master-plan.html": "/master-plan/",
  "existing-units.html": "/existing-units/",
  "news-and-events.html": "/news-and-events/",
  "gallery.html": "/gallery/",
  "contact-us.html": "/contact-us/",
};

function redirectStub(target) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${target}">
<title>Redirecting… | IFFCO Kisan SEZ</title>
</head>
<body>
<p>This page has moved to <a href="${target}">${target}</a>.</p>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>
`;
}

let count = 0;
for (const [filename, target] of Object.entries(LEGACY_ROUTES)) {
  writeFileSync(path.join(outDir, filename), redirectStub(target));
  count++;
}

console.log(`✓ Wrote ${count} legacy .html redirect stub(s) into out/`);
