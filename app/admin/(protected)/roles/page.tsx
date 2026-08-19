import { KeyRound } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminRolePage() {
  return (
    <>
      <AdminPageHeader icon={<KeyRound className="w-4 h-4" />} title="Role" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Role" />
    </>
  );
}
