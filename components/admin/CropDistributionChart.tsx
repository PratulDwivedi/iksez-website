'use client';

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { AgriCropDistribution } from '@/lib/agriDashboard';

// Same recharts conventions as PageviewsChart.tsx (BarChart + LabelList +
// ResponsiveContainer, primary-500 fill via CSS var) but horizontal —
// crop names are the categorical axis here, so a horizontal bar reads
// better than PageviewsChart's vertical/time-series layout.
const ROW_HEIGHT = 32;

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as AgriCropDistribution;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-slate-900 dark:text-white">{d.crop}</p>
      <p className="text-slate-500 dark:text-slate-400">{d.acres.toLocaleString()} acres</p>
    </div>
  );
}

export function CropDistributionChart({ data }: { data: AgriCropDistribution[] }) {
  return (
    <div style={{ width: '100%', height: Math.max(data.length * ROW_HEIGHT, 160) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, left: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--color-slate-200)" strokeDasharray="3 3" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="crop"
            width={80}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--color-slate-500)' }}
          />
          <Tooltip content={ChartTooltip} cursor={{ fill: 'var(--color-slate-500)', fillOpacity: 0.08 }} />
          <Bar dataKey="acres" fill="var(--color-primary-500)" radius={[0, 4, 4, 0]} barSize={14}>
            <LabelList
              dataKey="acres"
              position="right"
              className="fill-slate-500 dark:fill-slate-400 tabular-nums"
              fontSize={10}
              fontWeight={700}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
