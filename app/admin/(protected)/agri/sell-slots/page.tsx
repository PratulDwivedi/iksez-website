import { ShoppingCart } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComingSoonPlaceholder } from '@/components/admin/ComingSoonPlaceholder';

export default function AdminCropSellSlotsPage() {
  return (
    <>
      <AdminPageHeader icon={<ShoppingCart className="w-4 h-4" />} title="Crop Sell Slots" subtitle="Coming soon." />
      <ComingSoonPlaceholder title="Crop Sell Slots" />
    </>
  );
}
