import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewsEventForm, type NewsEventFormPost } from '@/components/admin/NewsEventForm';

export default async function EditNewsEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Direct table read (bypasses fn_get_website_news_events), same pattern as
  // blogs/[id]/page.tsx — relies on RLS rather than the RPC for the
  // single-row edit fetch.
  const { data: post } = await supabase
    .from('website_news_events')
    .select('id, title, event_date, gallery, body, published')
    .eq('id', Number(id))
    .single<NewsEventFormPost>();

  if (!post) {
    notFound();
  }

  return <NewsEventForm post={post} />;
}
