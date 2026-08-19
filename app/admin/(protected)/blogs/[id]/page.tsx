import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getQuickList, BLOG_CATEGORY_PARENT_ID } from '@/lib/quickLists';
import { BlogForm, type BlogFormPost } from '@/components/admin/BlogForm';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: post }, categories] = await Promise.all([
    supabase
      .from('website_blogs')
      .select(
        'id, name, title, excerpt, category_id, cover_url, cover_alt, tags, keywords, author_name, author_role, read_minutes, body, published, data'
      )
      .eq('id', Number(id))
      .single<BlogFormPost>(),
    getQuickList(BLOG_CATEGORY_PARENT_ID),
  ]);

  if (!post) {
    notFound();
  }

  return <BlogForm post={post} categories={categories} />;
}
