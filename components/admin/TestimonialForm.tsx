'use client';

import { useActionState } from 'react';
import { Quote, Loader2 } from 'lucide-react';
import { saveTestimonial } from '@/app/admin/(protected)/testimonials/actions';
import { AdminPageHeader } from './AdminPageHeader';
import { CollapsibleSection } from './CollapsibleSection';

export interface TestimonialFormRow {
  id: number;
  quote: string;
  author_name: string;
  author_role: string | null;
  company: string | null;
  avatar_url: string | null;
  rating: number;
  display_order: number;
  published: boolean;
}

// Matches BlogForm.tsx's input/label typography exactly, same
// amber/slate-themed convention.
const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:outline-none focus:border-primary-500 transition';
const labelCls =
  'text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block';

const FORM_ID = 'testimonial-form';

export function TestimonialForm({ testimonial }: { testimonial?: TestimonialFormRow }) {
  const [state, formAction, pending] = useActionState(saveTestimonial, { error: null });

  return (
    <>
      <AdminPageHeader
        icon={<Quote className="w-4 h-4" />}
        title={testimonial ? 'Edit Testimonial' : 'New Testimonial'}
        subtitle={testimonial ? testimonial.author_name : 'Add a client testimonial.'}
        action={
          <button
            type="submit"
            form={FORM_ID}
            disabled={pending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-colors"
          >
            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {pending ? 'Saving…' : testimonial ? 'Save Changes' : 'Create Testimonial'}
          </button>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        <form id={FORM_ID} action={formAction} className="space-y-4">
          {testimonial && <input type="hidden" name="id" defaultValue={testimonial.id} />}

          {state.error && (
            <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          <CollapsibleSection title="Quote">
            <div>
              <label className={labelCls} htmlFor="quote">Quote</label>
              <textarea
                id="quote"
                name="quote"
                required
                rows={4}
                defaultValue={testimonial?.quote}
                className={inputCls}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Author">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="author_name">Author name</label>
                  <input id="author_name" name="author_name" required defaultValue={testimonial?.author_name} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="author_role">Role (optional)</label>
                  <input id="author_role" name="author_role" defaultValue={testimonial?.author_role ?? ''} className={inputCls} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="company">Company (optional)</label>
                  <input id="company" name="company" defaultValue={testimonial?.company ?? ''} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="avatar_url">
                    Avatar URL
                    <span className="ml-1 font-normal normal-case text-slate-400">
                      (optional — paste a URL from Media, or leave blank for the default silhouette)
                    </span>
                  </label>
                  <input id="avatar_url" name="avatar_url" defaultValue={testimonial?.avatar_url ?? ''} className={inputCls} />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Display">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="rating">Rating (1–5)</label>
                  <select
                    id="rating"
                    name="rating"
                    defaultValue={String(testimonial?.rating ?? 5)}
                    className={inputCls}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="display_order">
                    Display order
                    <span className="ml-1 font-normal normal-case text-slate-400">(lower shows first)</span>
                  </label>
                  <input
                    id="display_order"
                    name="display_order"
                    type="number"
                    defaultValue={testimonial?.display_order ?? 0}
                    className={inputCls}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={testimonial?.published ?? true}
                  className="rounded"
                />
                Published (unchecked = draft, hidden from the public site)
              </label>
            </div>
          </CollapsibleSection>
        </form>
      </div>
    </>
  );
}
