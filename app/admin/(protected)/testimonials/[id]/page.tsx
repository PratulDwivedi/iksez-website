import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TestimonialForm, type TestimonialFormRow } from '@/components/admin/TestimonialForm';

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: testimonial } = await supabase
    .from('website_testimonials')
    .select('id, quote, author_name, author_role, company, avatar_url, rating, display_order, published')
    .eq('id', Number(id))
    .single<TestimonialFormRow>();

  if (!testimonial) {
    notFound();
  }

  return <TestimonialForm testimonial={testimonial} />;
}
