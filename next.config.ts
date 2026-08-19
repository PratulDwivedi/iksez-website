import type { NextConfig } from "next";

/**
 * Static export: the client's IIS hosting has no Node.js runtime, so the
 * build output must be plain HTML/CSS/JS (`out/`), deployable exactly like
 * the previous site.
 *
 * trailingSlash: true gives clean canonical URLs (/about-us/) that export as
 * /about-us/index.html — works with next dev (no dev/prod URL mismatch) and
 * needs zero server config to serve on IIS (default-document resolution
 * handles the rest). The site's old *.html URLs (bookmarks, backlinks,
 * indexed search results) still work too: scripts/generate-legacy-redirects.mjs
 * runs after every build and writes a redirect stub (e.g. about-us.html ->
 * /about-us/) for each old filename into out/.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
