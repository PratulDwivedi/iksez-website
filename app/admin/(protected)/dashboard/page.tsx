import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BarChart3, Eye, Activity, UserPlus, FileText, Image as ImageIcon, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ApiIntegrationButton } from '@/components/admin/ApiIntegrationButton';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { PageviewsChart } from '@/components/admin/PageviewsChart';
import { StatTile } from '@/components/admin/StatTile';
import { RankedList } from '@/components/admin/RankedList';
import { SITE_URL } from '@/lib/siteUrl';

const ANALYTICS_API_RESPONSE_EXAMPLE = `{
  "is_success": true,
  "message": "Event tracked",
  "status_code": 200,
  "data": [{ "id": 4821 }]
}`;

interface AnalyticsSummary {
  range_days: number;
  date_from: string;
  date_to: string;
  total_pageviews: number;
  total_events: number;
  unique_visitors: number;
  daily: { day: string; pageviews: number; visitors: number }[];
  top_pages: { path: string; pageviews: number }[];
  top_referrers: { referrer: string; pageviews: number }[];
  devices: { device_type: string; count: number }[];
  countries: { country: string; count: number }[];
}

const RANGE_OPTIONS = [7, 30, 90] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
function asIsoDate(value: string | undefined): string | undefined {
  return value && ISO_DATE.test(value) ? value : undefined;
}

// fn_get_website_leads/fn_get_website_blogs/fn_get_website_media's `paging`
// isn't exposed by callRpc (it only unwraps `data` — see
// src/lib/supabase/rpc.ts), so the KPI tiles that just need a count call the
// RPC directly here instead, reading paging.total_records off the raw
// envelope with p_page_size: 1 to keep the actual row payload minimal.
async function rpcTotal(
  supabase: SupabaseClient,
  fn: string,
  params: Record<string, unknown>
): Promise<number> {
  const { data } = await supabase.rpc(fn, params);
  const envelope = data as { is_success?: boolean; paging?: { total_records?: number } } | null;
  return envelope?.is_success ? envelope.paging?.total_records ?? 0 : 0;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; from?: string; to?: string }>;
}) {
  const { days: daysParam, from: fromParam, to: toParam } = await searchParams;
  const days = (RANGE_OPTIONS as readonly number[]).includes(Number(daysParam)) ? Number(daysParam) : 30;

  const from = asIsoDate(fromParam);
  const to = asIsoDate(toParam);
  const isCustomRange = !!from;

  const supabase = await createClient();

  const [{ data: summaryRows, error }, leadsTotal, blogsTotal, mediaTotal] = await Promise.all([
    callRpc<AnalyticsSummary[]>(supabase, 'fn_get_website_analytics_summary', {
      p_days: days,
      p_from: from ?? null,
      p_to: to ?? null,
    }),
    rpcTotal(supabase, 'fn_get_website_leads', { p_page_size: 1 }),
    rpcTotal(supabase, 'fn_get_website_blogs', { p_published: null, p_page_size: 1 }),
    rpcTotal(supabase, 'fn_get_website_media', { p_page_size: 1 }),
  ]);

  const stats = summaryRows?.[0];
  const hasAnalytics = !!stats && stats.total_events > 0;

  return (
    <>
      <AdminPageHeader
        icon={<BarChart3 className="w-4 h-4" />}
        title="CMS Dashboard"
        subtitle="Live overview of your site."
        action={
          <>
            <ApiIntegrationButton
              title="Track Event API"
              description="Send pageview/event hits from another site into this tenant's dashboard."
              method="POST"
              endpoint="/api/analytics"
              params={[
                { name: 'x-api-key', in: 'header', description: "Your tenant's publishable API key. Required.", required: true },
                { name: 'path', in: 'body', description: 'Page path, e.g. "/pricing". Required unless url is sent.' },
                { name: 'url', in: 'body', description: 'Full page URL. Required unless path is sent.' },
                { name: 'title, referrer', in: 'body', description: 'Optional strings.' },
                { name: 'visitor_id, session_id', in: 'body', description: 'Optional — a stable id per visitor/tab so unique-visitor counts are accurate. Auto-generated (localStorage/sessionStorage) by this site\'s own PageviewTracker.tsx.' },
                { name: 'event_type, event_name', in: 'body', description: 'Optional — defaults to "pageview". Use "custom" + event_name for non-pageview events.' },
                { name: 'data', in: 'body', description: 'Optional freeform object for extra event properties.' },
              ]}
              requestExample={`curl -X POST "${SITE_URL}/api/analytics" \\\n  -H "x-api-key: YOUR_PUBLISHABLE_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"path":"/pricing","title":"Pricing","referrer":"https://google.com","visitor_id":"...","session_id":"..."}'`}
              responseExample={ANALYTICS_API_RESPONSE_EXAMPLE}
              keyNote="Required — like the Leads API, there's no keyless default, so a missing or invalid key is rejected instead of attributing the hit to any tenant. Browser/OS/device are parsed server-side from the User-Agent header, not trusted from the client."
            />
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5">
              {RANGE_OPTIONS.map((r) => (
                <Link
                  key={r}
                  href={`/admin/dashboard?days=${r}`}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    !isCustomRange && days === r
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {r}d
                </Link>
              ))}
            </div>
            <form
              action="/admin/dashboard"
              method="get"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-0.5"
            >
              <input
                type="date"
                defaultValue={from}
                max={to}
                required
                className="bg-transparent text-[11px] font-semibold text-slate-600 dark:text-slate-300 outline-none w-[110px]"
              />
              <span className="text-[11px] text-slate-400">to</span>
              <input
                type="date"
                name="to"
                defaultValue={to}
                min={from}
                className="bg-transparent text-[11px] font-semibold text-slate-600 dark:text-slate-300 outline-none w-[110px]"
              />
              <button
                type="submit"
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  isCustomRange
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Apply
              </button>
            </form>
            <RefreshButton />
          </>
        }
      />

      <div className="px-3 sm:px-6 py-4 space-y-4">
        {error && (
          <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatTile icon={<Eye className="w-3.5 h-3.5" />} label="Pageviews" value={stats?.total_pageviews ?? 0} />
          <StatTile
            icon={<Activity className="w-3.5 h-3.5" />}
            label="Unique visitors"
            value={stats?.unique_visitors ?? 0}
          />
          <StatTile icon={<UserPlus className="w-3.5 h-3.5" />} label="Leads" value={leadsTotal} />
          <StatTile icon={<FileText className="w-3.5 h-3.5" />} label="Blog posts" value={blogsTotal} />
          <StatTile icon={<ImageIcon className="w-3.5 h-3.5" />} label="Media files" value={mediaTotal} />
        </div>

        {!hasAnalytics ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
            <KeyRound className="w-5 h-5 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No analytics recorded yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Send pageview hits to <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">POST /api/analytics</code> from
              any site using its Publishable API Key (see{' '}
              <Link href="/admin/settings" className="font-bold text-primary-600 dark:text-primary-500 hover:underline">
                Settings
              </Link>
              ) and this page fills in automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-3">
                {isCustomRange
                  ? `Pageviews — ${stats.date_from} to ${stats.date_to}`
                  : `Pageviews — last ${days} days`}
              </h2>
              <PageviewsChart daily={stats.daily} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-3">Top pages</h2>
                <RankedList
                  items={stats.top_pages.map((p) => ({ label: p.path, count: p.pageviews }))}
                  emptyMessage="No page data yet."
                />
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-3">Top referrers</h2>
                <RankedList
                  items={stats.top_referrers.map((r) => ({ label: r.referrer, count: r.pageviews }))}
                  emptyMessage="No referrer data yet."
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-3">Devices</h2>
                <RankedList
                  items={stats.devices.map((d) => ({ label: d.device_type, count: d.count }))}
                  emptyMessage="No device data yet."
                />
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-3">Countries</h2>
                <RankedList
                  items={stats.countries.map((c) => ({ label: c.country, count: c.count }))}
                  emptyMessage="No country data yet."
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
