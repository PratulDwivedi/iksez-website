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

  const [{ data: post }, categories, { data: translations }] = await Promise.all([
    supabase
      .from('website_blogs')
      .select(
        'id, name, title, excerpt, category_id, cover_url, cover_alt, tags, keywords, author_name, author_role, read_minutes, body, published, data'
      )
      .eq('id', Number(id))
      .single<BlogFormPost>(),
    getQuickList(BLOG_CATEGORY_PARENT_ID),
    callRpc<BlogTranslation[]>(supabase, 'fn_get_website_blog_translations', { p_blog_id: Number(id) }),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <BlogForm post={post} categories={categories} translations={translations ?? []} initialError={error ?? null} />
  );
}
