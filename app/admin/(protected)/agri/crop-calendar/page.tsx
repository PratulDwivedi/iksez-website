import { CalendarDays } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminCropCalendarPage() {
  return (
    <>
      <AdminPageHeader icon={<CalendarDays className="w-4 h-4" />} title="Crop Calendar" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Crop Calendar" />
    </>
  );
}
