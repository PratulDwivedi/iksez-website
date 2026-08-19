import { BarChart3 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

// Shown while AdminDashboardPage's Promise.all (analytics summary + leads/
// blogs/media totals, 4 RPCs) resolves. Without this, the sidebar/shell
// (already rendered by (protected)/layout.tsx by the time this segment is
// reached) sat next to a blank pane until every RPC finished — this fills
// that gap with a skeleton matching the real layout below instead of
// leaving the page looking stuck.
function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <>
      <AdminPageHeader icon={<BarChart3 className="w-4 h-4" />} title="Dashboard" subtitle="Live overview of your site." />
      <div className="px-3 sm:px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Pulse key={i} className="h-[72px]" />
          ))}
        </div>
        <Pulse className="h-52" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Pulse className="h-40" />
          <Pulse className="h-40" />
        </div>
      </div>
    </>
  );
}
