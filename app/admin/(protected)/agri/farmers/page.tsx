import { UserRound } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminFarmersPage() {
  return (
    <>
      <AdminPageHeader icon={<UserRound className="w-4 h-4" />} title="Farmers" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Farmers" />
    </>
  );
}
