import { LifeBuoy } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminTableSkeleton } from '@/components/admin/AdminTableSkeleton';

// Same reasoning as dashboard/loading.tsx — paints the header immediately
// instead of blocking on fn_get_website_tickets.
export default function TicketsLoading() {
  return (
    <>
      <AdminPageHeader icon={<LifeBuoy className="w-4 h-4" />} title="Tickets" subtitle="Support tickets raised from the Helpline page, integrated sites, or converted from leads." />
      <div className="px-3 sm:px-4 py-4">
        <AdminTableSkeleton />
      </div>
    </>
  );
}
