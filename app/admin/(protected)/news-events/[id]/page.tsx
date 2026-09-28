import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import type { NewsEventRow } from '@/lib/publicNewsEvents';
import { NewsEventForm } from '@/components/admin/NewsEventForm';

export default async function EditNewsEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Same tenant-scoped RPC and params as the News & Events list page, rather
  // than a direct table read that depends on RLS policies (and 404s without
  // them). p_published: null so drafts are editable too.
  const { data: items } = await callRpc<NewsEventRow[]>(supabase, 'fn_get_website_news_events', {
    p_published: null,
    p_page_size: 1000,
  });
  const post = items?.find((item) => item.id === Number(id));

  if (!post) {
    notFound();
  }

  return <NewsEventForm post={post} />;
}
