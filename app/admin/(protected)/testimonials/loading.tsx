import { Quote } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminTableSkeleton } from '@/components/admin/AdminTableSkeleton';

// Same reasoning as dashboard/loading.tsx — paints the header immediately
// instead of blocking on fn_get_website_testimonials.
export default function TestimonialsLoading() {
  return (
    <>
      <AdminPageHeader icon={<Quote className="w-4 h-4" />} title="Testimonials" subtitle="Manage client testimonials shown on the public site." />
      <div className="px-3 sm:px-4 py-4">
        <AdminTableSkeleton />
      </div>
    </>
  );
}
