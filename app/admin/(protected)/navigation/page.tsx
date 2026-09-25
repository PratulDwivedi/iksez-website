import { Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import type { AdminNavItem } from '@/lib/adminNav';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { NavigationManager } from '@/components/admin/NavigationManager';

// The website's header menu and everything under it (website_nav_items):
// links to coded pages, CMS pages with their own content, and PDF documents
// such as Reports & Policies' annual reports.
export default async function AdminNavigationPage() {
  const supabase = await createClient();
  const { data: items, error } = await callRpc<AdminNavItem[]>(supabase, 'fn_get_website_nav_items');

  return (
    <>
      <AdminPageHeader
        icon={<Menu className="w-4 h-4" />}
        title="Website Navigation"
        subtitle="Header menu, pages and documents (Reports & Policies, CSR, …) in every language."
      />
      <div className="px-3 sm:px-6 py-4">
        {error ? (
          <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : (
          <NavigationManager items={items ?? []} />
        )}
      </div>
    </>
  );
}
