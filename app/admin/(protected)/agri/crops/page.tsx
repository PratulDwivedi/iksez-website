import { Wheat } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminCropsPage() {
  return (
    <>
      <AdminPageHeader icon={<Wheat className="w-4 h-4" />} title="Crops" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Crops" />
    </>
  );
}
