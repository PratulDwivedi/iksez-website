import { UserCog } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminUserPage() {
  return (
    <>
      <AdminPageHeader icon={<UserCog className="w-4 h-4" />} title="User" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="User" />
    </>
  );
}
