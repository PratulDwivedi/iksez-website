// Shared loading-state placeholder for the admin list pages (blogs,
// testimonials, leads, tickets, media) — a rounded card of pulsing rows
// standing in for AdminDataTable while its RPC is still in flight. Row
// count/heights are cosmetic (not measured against a real table), just
// enough rows to fill a typical viewport without layout jumping once real
// data replaces it.
export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="h-11 bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 flex items-center gap-4 px-4 bg-white dark:bg-slate-950">
            <div className="h-3 w-1/4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-3 w-1/6 rounded bg-slate-100 dark:bg-slate-800 animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
