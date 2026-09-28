import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { getQuickList, BLOG_CATEGORY_PARENT_ID } from '@/lib/quickLists';
import { BlogForm, type BlogFormPost } from '@/components/admin/BlogForm';
import type { BlogTranslation } from '@/lib/blogTranslations';

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  // Set by saveBlogPost when a new post saved but its translation didn't.
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: posts }, categories, { data: translations }] = await Promise.all([
    // Via fn_get_website_blogs (tenant-scoped, SECURITY DEFINER) rather than a
    // direct table read, which depends on RLS policies and 404s without them.
    // p_published: null so drafts are editable too.
    callRpc<BlogFormPost[]>(supabase, 'fn_get_website_blogs', {
      p_id: Number(id),
      p_published: null,
      p_page_size: 1,
    }),
    getQuickList(BLOG_CATEGORY_PARENT_ID),
    callRpc<BlogTranslation[]>(supabase, 'fn_get_website_blog_translations', { p_blog_id: Number(id) }),
  ]);

  const post = posts?.[0];
  if (!post) {
    notFound();
  }

  return (
    <BlogForm post={post} categories={categories} translations={translations ?? []} initialError={error ?? null} />
  );
}
