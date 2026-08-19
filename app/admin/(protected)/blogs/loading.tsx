import { FileText } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminTableSkeleton } from '@/components/admin/AdminTableSkeleton';

// Same reasoning as dashboard/loading.tsx: without this, the sidebar/shell
// (already rendered by (protected)/layout.tsx) sat next to a blank pane
// until fn_get_website_blogs resolved. This fills that gap so the header
// paints immediately and only the table area shows a loading skeleton.
export default function BlogsLoading() {
  return (
    <>
      <AdminPageHeader icon={<FileText className="w-4 h-4" />} title="Blog Posts" subtitle="Manage and publish posts to the live site." />
      <div className="px-3 sm:px-4 py-4">
        <AdminTableSkeleton />
      </div>
    </>
  );
}
