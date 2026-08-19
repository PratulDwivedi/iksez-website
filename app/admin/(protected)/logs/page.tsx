import { ScrollText } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminLogsPage() {
  return (
    <>
      <AdminPageHeader icon={<ScrollText className="w-4 h-4" />} title="Logs" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Logs" />
    </>
  );
}
