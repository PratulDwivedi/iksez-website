import { Image as ImageIcon } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

// Same reasoning as dashboard/loading.tsx — paints the header immediately
// instead of blocking on fn_get_website_media. MediaLibrary is a grid of
// thumbnails, not a table, so its skeleton mirrors that layout instead of
// reusing AdminTableSkeleton.
export default function MediaLoading() {
  return (
    <>
      <AdminPageHeader icon={<ImageIcon className="w-4 h-4" />} title="Media" subtitle="Upload images and files, then reuse them on this or another site." />
      <div className="px-3 sm:px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
          ))}
        </div>
      </div>
    </>
  );
}
