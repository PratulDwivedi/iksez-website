import { FileSpreadsheet } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminFactsheetsPage() {
  return (
    <>
      <AdminPageHeader icon={<FileSpreadsheet className="w-4 h-4" />} title="Factsheets" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Factsheets" />
    </>
  );
}
