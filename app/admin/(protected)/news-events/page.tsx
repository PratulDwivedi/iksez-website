import Link from 'next/link';
import { Newspaper, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import type { NewsEventRow } from '@/lib/publicNewsEvents';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { NewsEventListTable } from '@/components/admin/NewsEventListTable';

export default async function AdminNewsEventsPage() {
  const supabase = await createClient();

  // Same reasoning as the Blogs list (see that page.tsx's comment):
  // fn_get_website_news_events resolves the tenant from the admin's own
  // session, p_published: null shows drafts too, and p_page_size covers the
  // whole list since AdminDataTable paginates client-side.
  const { data: items, error } = await callRpc<NewsEventRow[]>(supabase, 'fn_get_website_news_events', {
    p_published: null,
    p_page_size: 1000,
  });

  return (
    <>
      <AdminPageHeader
        icon={<Newspaper className="w-4 h-4" />}
        title="News & Events"
        subtitle="Manage and publish News & Events items to the live site."
        action={
          <Link
            href="/admin/news-events/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Item
          </Link>
        }
      />

      <div className="px-3 sm:px-4 py-4">
        {error ? (
          <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : (
          <NewsEventListTable items={items ?? []} />
        )}
      </div>
    </>
  );
}
