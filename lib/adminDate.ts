// Explicit 'en-GB' locale (day-before-month, e.g. "01 Aug 2026") rather than
// the ambient/browser locale `toLocaleDateString()` would otherwise use.
// Two reasons: (1) an unqualified locale defaults to whatever the Node
// runtime's ICU locale is on the server and whatever the visiting browser's
// locale is on the client — these can differ, which throws a React hydration
// mismatch since the server-rendered string won't match the client's
// re-render; (2) this admin panel is used from India, where day-before-month
// is the expected convention, and a plain "8/1/2026" reads as US-style
// month-first regardless of which admin's machine renders it.
export function formatAdminDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Day/month only, no year — for contexts like a chart tooltip where the
// surrounding UI already establishes the year/period.
export function formatAdminDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}
