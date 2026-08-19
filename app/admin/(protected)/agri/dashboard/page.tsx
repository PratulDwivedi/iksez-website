import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LandPlot,
  HelpCircle,
  ShoppingCart,
  FileSpreadsheet,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { StatTile } from '@/components/admin/StatTile';
import { CropDistributionChart } from '@/components/admin/CropDistributionChart';
import { formatAdminDate } from '@/lib/adminDate';
import {
  getAgriDashboardSummary,
  type AgriCropSeason,
  type AgriQuery,
  type AgriCalendarEvent,
  type AgriSellSlot,
} from '@/lib/agriDashboard';

const SEASON_STATUS_CLS: Record<AgriCropSeason['status'], string> = {
  planning: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  active: 'bg-primary-500/10 text-primary-600 dark:text-primary-500',
  closed: 'bg-slate-200 dark:bg-slate-800 text-slate-500',
};

const QUERY_STATUS_CLS: Record<AgriQuery['status'], string> = {
  open: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  answered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  closed: 'bg-slate-200 dark:bg-slate-800 text-slate-500',
};

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function SeasonRow({ season }: { season: AgriCropSeason }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{season.name}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${SEASON_STATUS_CLS[season.status]}`}
        >
          {season.status}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-primary-500" style={{ width: `${season.progress}%` }} />
      </div>
    </div>
  );
}

function QueryRow({ query }: { query: AgriQuery }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{query.subject}</p>
        <p className="text-slate-400 mt-0.5">
          {query.farmer_name} &middot; {query.crop} &middot; {formatAdminDate(query.created_at)}
        </p>
      </div>
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${QUERY_STATUS_CLS[query.status]}`}
      >
        {query.status}
      </span>
    </div>
  );
}

function CalendarRow({ event }: { event: AgriCalendarEvent }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{event.activity}</p>
        <p className="text-slate-400 mt-0.5">{event.crop}</p>
      </div>
      <span className="shrink-0 font-bold text-slate-500 dark:text-slate-400 tabular-nums">
        {formatAdminDate(event.date)}
      </span>
    </div>
  );
}

function SellSlotRow({ slot }: { slot: AgriSellSlot }) {
  const pct = Math.min(100, Math.round((slot.booked / slot.capacity) * 100));
  return (
    <div className="py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {slot.crop} &middot; {slot.location}
        </span>
        <span className="text-slate-400 shrink-0">{formatAdminDate(slot.date)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="w-14 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
          {slot.booked}/{slot.capacity}
        </span>
      </div>
    </div>
  );
}

export default async function AgriDashboardPage() {
  const summary = await getAgriDashboardSummary();

  return (
    <>
      <AdminPageHeader
        icon={<LayoutDashboard className="w-4 h-4" />}
        title="Agri Dashboard"
        subtitle="Farmers, crops & seasonal operations overview."
        action={<RefreshButton />}
      />

      <div className="px-3 sm:px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatTile icon={<Users className="w-3.5 h-3.5" />} label="Farmers" value={summary.total_farmers} />
          <StatTile
            icon={<UserPlus className="w-3.5 h-3.5" />}
            label="New this month"
            value={summary.new_farmers_this_month}
          />
          <StatTile
            icon={<LandPlot className="w-3.5 h-3.5" />}
            label="Land (acres)"
            value={summary.total_land_acres.toLocaleString()}
          />
          <StatTile icon={<HelpCircle className="w-3.5 h-3.5" />} label="Open queries" value={summary.open_queries} />
          <StatTile
            icon={<ShoppingCart className="w-3.5 h-3.5" />}
            label="Active sell slots"
            value={summary.active_sell_slots}
          />
          <StatTile
            icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            label="Factsheets"
            value={summary.published_factsheets}
          />
        </div>

        <Panel title="Crop-wise land under cultivation">
          <CropDistributionChart data={summary.crop_distribution} />
        </Panel>

        <div className="grid sm:grid-cols-2 gap-4">
          <Panel title="Crop seasons">
            <div className="space-y-4">
              {summary.crop_seasons.map((season) => (
                <SeasonRow key={season.name} season={season} />
              ))}
            </div>
          </Panel>
          <Panel title="Recent farmer queries">
            {summary.recent_queries.map((query) => (
              <QueryRow key={query.id} query={query} />
            ))}
          </Panel>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Panel title="Upcoming crop calendar">
            {summary.upcoming_calendar.map((event, i) => (
              <CalendarRow key={`${event.crop}-${i}`} event={event} />
            ))}
          </Panel>
          <Panel title="Upcoming sell slots">
            {summary.upcoming_sell_slots.map((slot) => (
              <SellSlotRow key={slot.id} slot={slot} />
            ))}
          </Panel>
        </div>
      </div>
    </>
  );
}
