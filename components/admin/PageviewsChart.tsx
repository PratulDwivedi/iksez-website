'use client';

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { formatAdminDateShort } from '@/lib/adminDate';

interface DailyPoint {
  day: string;
  pageviews: number;
  visitors: number;
}

// Recharts needs an explicit pixel width per bar to size the scrollable
// track (ResponsiveContainer only fills whatever fixed-width div it's
// given) — 32px/day matches the old hand-rolled chart's bar+gap spacing.
const PX_PER_DAY = 32;

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DailyPoint;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-slate-900 dark:text-white">{formatAdminDateShort(d.day)}</p>
      <p className="text-slate-500 dark:text-slate-400">
        {d.pageviews} pageviews &middot; {d.visitors} visitors
      </p>
    </div>
  );
}

export function PageviewsChart({ daily }: { daily: DailyPoint[] }) {
  return (
    <div className="overflow-x-auto">
      <div style={{ width: Math.max(daily.length * PX_PER_DAY, 320), height: 192 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={daily} margin={{ top: 16, right: 4, left: 4, bottom: 0 }} barCategoryGap={4}>
            <Tooltip content={ChartTooltip} cursor={{ fill: 'var(--color-slate-500)', fillOpacity: 0.08 }} />
            <Bar dataKey="pageviews" fill="var(--color-primary-500)" radius={[2, 2, 0, 0]} minPointSize={2}>
              <LabelList
                dataKey="pageviews"
                position="top"
                className="fill-slate-500 dark:fill-slate-400 tabular-nums"
                fontSize={9}
                fontWeight={700}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
