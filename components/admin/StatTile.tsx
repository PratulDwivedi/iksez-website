import type { ReactNode } from 'react';

// Shared KPI tile — extracted from the CMS dashboard so the Agri dashboard
// (and any future one) uses the same building block instead of each page
// re-implementing it.
export function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{value}</p>
    </div>
  );
}
