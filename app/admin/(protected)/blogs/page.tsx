import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import type { BlogRow } from '@/lib/publicBlogs';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BlogListTable } from '@/components/admin/BlogListTable';
import { ApiIntegrationButton } from '@/components/admin/ApiIntegrationButton';

const BLOGS_API_RESPONSE_EXAMPLE = `{
  "is_success": true,
  "message": "Website blogs retrieved successfully",
  "status_code": 200,
  "data": [
    {
      "id": 1,
      "name": "zero-downtime-website-migration-guide",
      "title": "Zero-Downtime Website Migrations: A Technical Blueprint",
      "excerpt": "How we execute seamless platform transfers with zero revenue loss...",
      "category": "Website Migration",
      "cover_url": "/blog/zero-downtime-migration.svg",
      "cover_alt": "Diagram of a legacy server stack linked to new infrastructure",
      "tags": ["Website Migration", "Zero Downtime"],
      "keywords": ["zero downtime migration"],
      "author_name": "Pratul Dwivedi",
      "author_role": null,
      "read_minutes": 6,
      "body": [{ "type": "paragraph", "text": "..." }],
      "published": true,
      "is_active": true,
      "data": { "faqs": [{ "question": "...", "answer": "..." }] },
      "published_at": "2026-07-18T00:00:00+00:00",
      "created_at": "2026-07-18T00:00:00+00:00",
      "updated_at": "2026-07-18T00:00:00+00:00"
    }
  ],
  "paging": {
    "total_records": 3,
    "page_size": 9,
    "page_index": 1
  }
}`;

const BLOG_TAGS_API_RESPONSE_EXAMPLE = `{
  "is_success": true,
  "message": "Website blog tags retrieved successfully",
  "status_code": 200,
  "data": ["Core Web Vitals", "DNS Automation", "Zero Downtime"]
}`;

const BLOG_POST_API_RESPONSE_EXAMPLE = `{
  "is_success": true,
  "message": "Website blog retrieved successfully",
  "status_code": 200,
  "data": [
    {
      "id": 1,
      "name": "zero-downtime-website-migration-guide",
      "title": "Zero-Downtime Website Migrations: A Technical Blueprint",
      "excerpt": "How we execute seamless platform transfers with zero revenue loss...",
      "category": "Website Migration",
      "cover_url": "/blog/zero-downtime-migration.svg",
      "cover_alt": "Diagram of a legacy server stack linked to new infrastructure",
      "tags": ["Website Migration", "Zero Downtime"],
      "keywords": ["zero downtime migration"],
      "author_name": "Pratul Dwivedi",
      "author_role": null,
      "read_minutes": 6,
      "body": [{ "type": "paragraph", "text": "..." }],
      "published": true,
      "is_active": true,
      "data": { "faqs": [{ "question": "...", "answer": "..." }] },
      "published_at": "2026-07-18T00:00:00+00:00",
      "created_at": "2026-07-18T00:00:00+00:00",
      "updated_at": "2026-07-18T00:00:00+00:00"
    }
  ]
}`;

export default async function AdminBlogsPage() {
  const supabase = await createClient();

  // fn_get_website_blogs resolves the caller's tenant from the admin's own
  // JWT session (fn_get_request_context's no-x-api-key branch — see
  // supabase/functions/fn_get_website_blogs.sql) — this is what scopes the
  // list to only this tenant's posts. The previous direct
  // `.from('website_blogs').select(...)` relied solely on
  // website_blogs_admin_all's fn_is_admin() RLS, which has no tenant
  // condition at all, so it showed every tenant's posts to any admin.
  // p_published: null shows drafts too; p_page_size covers the whole list
  // since AdminDataTable paginates client-side over the full result.
  const { data: posts, error } = await callRpc<BlogRow[]>(supabase, 'fn_get_website_blogs', {
    p_published: null,
    p_page_size: 1000,
  });

  return (
    <>
      <AdminPageHeader
        icon={<FileText className="w-4 h-4" />}
        title="Blog Posts"
        subtitle="Manage and publish posts to the live site."
        action={
          <>
            <ApiIntegrationButton
              title="List Blogs API"
              description="Integrate this site's blog list into another website."
              method="GET"
              endpoint="/api/blogs"
              params={[
                { name: 'x-api-key', in: 'header', description: "Your tenant's publishable API key. Required.", required: true },
                { name: 'q', in: 'query', description: 'Keyword search across title and excerpt.' },
                { name: 'category', in: 'query', description: 'Exact category match, e.g. "Website Migration".' },
                { name: 'tags', in: 'query', description: 'Comma-separated tag names, e.g. "Core Web Vitals,Zero Downtime". Matches a post with ANY of the listed tags.' },
                { name: 'page', in: 'query', description: 'Page number. Default 1.' },
                { name: 'pageSize', in: 'query', description: 'Results per page. Default 9.' },
              ]}
              requestExample={`curl "https://www.iksez.com/api/blogs?category=Website%20Migration&page=1" \\\n  -H "x-api-key: YOUR_PUBLISHABLE_API_KEY"`}
              responseExample={BLOGS_API_RESPONSE_EXAMPLE}
              keyNote="Required — like Leads and Analytics, there's no keyless default, so a missing or invalid key is rejected instead of falling back to any tenant."
            />
            <ApiIntegrationButton
              title="List Blog Tags API"
              description="Distinct tags across this tenant's published posts, for a tag-filter dropdown like /blog's on another site — drop in the same key used for List Blogs and it just works."
              method="GET"
              endpoint="/api/blogs/tags"
              params={[
                { name: 'x-api-key', in: 'header', description: "Your tenant's publishable API key. Required.", required: true },
              ]}
              requestExample={`curl "https://www.iksez.com/api/blogs/tags" \\\n  -H "x-api-key: YOUR_PUBLISHABLE_API_KEY"`}
              responseExample={BLOG_TAGS_API_RESPONSE_EXAMPLE}
              keyNote="Required — like Leads and Analytics, there's no keyless default, so a missing or invalid key is rejected instead of falling back to any tenant."
            />
            <ApiIntegrationButton
              title="Get Blog Post API"
              description="A single post by slug, for a detail page like /blog/[slug] on another site."
              method="GET"
              endpoint="/api/blogs/{slug}"
              params={[
                { name: 'x-api-key', in: 'header', description: "Your tenant's publishable API key. Required.", required: true },
                { name: 'slug', in: 'path', description: 'The post\'s slug, from the "name" field in List Blogs, e.g. /api/blogs/zero-downtime-website-migration-guide.', required: true },
              ]}
              requestExample={`curl "https://www.iksez.com/api/blogs/zero-downtime-website-migration-guide" \\\n  -H "x-api-key: YOUR_PUBLISHABLE_API_KEY"`}
              responseExample={BLOG_POST_API_RESPONSE_EXAMPLE}
              keyNote="Required — like Leads and Analytics, there's no keyless default, so a missing or invalid key is rejected instead of falling back to any tenant. Returns 404 if no published post matches the slug."
            />
            <Link
              href="/admin/blogs/new"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Post
            </Link>
          </>
        }
      />

      <div className="px-3 sm:px-4 py-4">
        {error ? (
          <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : (
          <BlogListTable posts={posts ?? []} />
        )}
      </div>
    </>
  );
}
