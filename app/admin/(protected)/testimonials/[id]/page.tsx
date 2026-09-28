import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import type { TestimonialRow } from '@/lib/publicTestimonials';
import { TestimonialForm } from '@/components/admin/TestimonialForm';

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Same tenant-scoped RPC and params as the Testimonials list page, rather
  // than a direct table read that depends on RLS policies (and 404s without
  // them). p_published: null so drafts are editable too.
  const { data: testimonials } = await callRpc<TestimonialRow[]>(supabase, 'fn_get_website_testimonials', {
    p_published: null,
    p_page_size: 1000,
  });
  const testimonial = testimonials?.find((row) => row.id === Number(id));

  if (!testimonial) {
    notFound();
  }

  return <TestimonialForm testimonial={testimonial} />;
}
