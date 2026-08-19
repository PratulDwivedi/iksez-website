import { CalendarRange } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminCropSeasonPage() {
  return (
    <>
      <AdminPageHeader icon={<CalendarRange className="w-4 h-4" />} title="Crop Season" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Crop Season" />
    </>
  );
}
