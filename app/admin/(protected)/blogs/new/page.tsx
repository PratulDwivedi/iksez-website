import { BlogForm } from '@/components/admin/BlogForm';
import { getQuickList, BLOG_CATEGORY_PARENT_ID } from '@/lib/quickLists';

export default async function NewBlogPostPage() {
  const categories = await getQuickList(BLOG_CATEGORY_PARENT_ID);
  return <BlogForm categories={categories} />;
}
