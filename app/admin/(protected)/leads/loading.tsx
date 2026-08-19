import { Users } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminTableSkeleton } from '@/components/admin/AdminTableSkeleton';

// Same reasoning as dashboard/loading.tsx — paints the header immediately
// instead of blocking on fn_get_website_leads.
export default function LeadsLoading() {
  return (
    <>
      <AdminPageHeader icon={<Users className="w-4 h-4" />} title="Leads" subtitle="Leads captured from your own site and integrated third-party sites." />
      <div className="px-3 sm:px-4 py-4">
        <AdminTableSkeleton />
      </div>
    </>
  );
}
