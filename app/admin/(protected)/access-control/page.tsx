import { Lock } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminAccessControlPage() {
  return (
    <>
      <AdminPageHeader icon={<Lock className="w-4 h-4" />} title="Access Control" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Access Control" />
    </>
  );
}
