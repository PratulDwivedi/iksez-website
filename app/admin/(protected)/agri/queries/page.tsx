import { HelpCircle } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminQueriesPage() {
  return (
    <>
      <AdminPageHeader icon={<HelpCircle className="w-4 h-4" />} title="Queries" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Queries" />
    </>
  );
}
