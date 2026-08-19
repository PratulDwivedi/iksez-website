// Shared "label + proportional bar + count" list — extracted from the CMS
// dashboard so the Agri dashboard (and any future one) uses the same
// building block instead of each page re-implementing it.
export function RankedList({
  items,
  emptyMessage,
}: {
  items: { label: string; count: number }[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-slate-400 py-6 text-center">{emptyMessage}</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 text-xs" title={`${item.count}`}>
          <span className="flex-1 min-w-0 truncate text-slate-600 dark:text-slate-300">{item.label}</span>
          <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
            <div
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}
