import Link from 'next/link';
import { Quote, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import type { TestimonialRow } from '@/lib/publicTestimonials';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TestimonialListTable } from '@/components/admin/TestimonialListTable';
import { ApiIntegrationButton } from '@/components/admin/ApiIntegrationButton';
import { SITE_URL } from '@/lib/siteUrl';

const TESTIMONIALS_API_RESPONSE_EXAMPLE = `{
  "is_success": true,
  "message": "Website testimonials retrieved successfully",
  "status_code": 200,
  "data": [
    {
      "id": 1,
      "quote": "IFFCO Kisan SEZ built a marketing site that finally does justice to what we're building.",
      "author_name": "Pratul Dwivedi",
      "author_role": "Founder",
      "company": "Artificial Wit",
      "avatar_url": null,
      "rating": 5,
      "display_order": 0,
      "published": true,
      "is_active": true,
      "created_at": "2026-08-01T00:00:00+00:00",
      "updated_at": "2026-08-01T00:00:00+00:00"
    }
  ],
  "paging": {
    "total_records": 3,
    "page_size": 50,
    "page_index": 1
  }
}`;

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();

  // Same tenant-resolution pattern as /admin/blogs: fn_get_website_testimonials
  // resolves the caller's tenant from the admin's own JWT session (no
  // x-api-key), scoping the list to only this tenant's rows.
  // p_published: null shows drafts too; p_page_size covers the whole list
  // since AdminDataTable paginates client-side over the full result.
  const { data: testimonials, error } = await callRpc<TestimonialRow[]>(
    supabase,
    'fn_get_website_testimonials',
    { p_published: null, p_page_size: 1000 }
  );

  return (
    <>
      <AdminPageHeader
        icon={<Quote className="w-4 h-4" />}
        title="Testimonials"
        subtitle="Manage client testimonials shown on the public site."
        action={
          <>
            <ApiIntegrationButton
              title="List Testimonials API"
              description="Integrate this tenant's testimonials into another website."
              method="GET"
              endpoint="/api/testimonials"
              params={[
                { name: 'x-api-key', in: 'header', description: "Your tenant's publishable API key. Required.", required: true },
                { name: 'page', in: 'query', description: 'Page number. Default 1.' },
                { name: 'pageSize', in: 'query', description: 'Results per page. Default 50.' },
              ]}
              requestExample={`curl "${SITE_URL}/api/testimonials?page=1" \\\n  -H "x-api-key: YOUR_PUBLISHABLE_API_KEY"`}
              responseExample={TESTIMONIALS_API_RESPONSE_EXAMPLE}
            />
            <Link
              href="/admin/testimonials/new"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Testimonial
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
          <TestimonialListTable testimonials={testimonials ?? []} />
        )}
      </div>
    </>
  );
}
