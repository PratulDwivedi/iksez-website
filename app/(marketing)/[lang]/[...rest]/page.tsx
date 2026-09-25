import { notFound } from "next/navigation";

// Any path under a locale that no other route matches (e.g. /te/nope/, or
// /nope/ which proxy.ts rewrites to /en/nope/) lands here, so the 404 is
// rendered by [lang]/not-found.tsx — inside the site layout and in the
// visitor's language — rather than by Next.js's bare default 404.
export default function CatchAll() {
  notFound();
}
