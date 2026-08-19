'use client';

import React from 'react';
import { useActionState } from 'react';
import { FileText, Loader2, Code, Eye } from 'lucide-react';
import { saveBlogPost } from '@/app/admin/(protected)/blogs/actions';
import { blocksToText, textToBlocks, type BlogBlock } from '@/lib/blogBody';
import { faqsToText, type FaqItem } from '@/lib/blogFaq';
import { AdminPageHeader } from './AdminPageHeader';
import { CollapsibleSection } from './CollapsibleSection';
import { CoverImageField } from './CoverImageField';
import { BlogBody } from '../BlogBody';
import type { QuickListItem } from '@/lib/quickLists';

export interface BlogFormPost {
  id: number;
  name: string;
  title: string;
  excerpt: string;
  category_id: number;
  cover_url: string;
  cover_alt: string;
  tags: string[];
  keywords: string[];
  author_name: string;
  author_role: string | null;
  read_minutes: number;
  body: BlogBlock[];
  published: boolean;
  data: { faqs?: FaqItem[] } | null;
}

// Matches artificial-wit-web-apps' ProfilePage.tsx input/label typography
// exactly (rounded-xl px-3 py-2.5 text-[13px] / text-[11px] uppercase
// tracking-wide labels), re-themed to this site's amber/slate palette.
const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:outline-none focus:border-primary-500 transition';
const labelCls =
  'text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block';

const FORM_ID = 'blog-form';

export function BlogForm({ post, categories }: { post?: BlogFormPost; categories: QuickListItem[] }) {
  const [state, formAction, pending] = useActionState(saveBlogPost, { error: null });

  // If the post's current category_id isn't in the fetched list (a
  // quick_lists row that's since been deactivated), keep it selectable
  // anyway — otherwise the <select> would silently fall back to its first
  // option while the actual saved category differs from what's visibly
  // selected (see CLAUDE.md's Known Issues: form defaults must match one of
  // their own <option> values). No name is available for it here (only the
  // id), so it's labeled generically rather than fetching just for this.
  const categoryOptions =
    post?.category_id && !categories.some((c) => c.id === post.category_id)
      ? [
          { id: post.category_id, name: `Category #${post.category_id} (unavailable)`, code: null, display_order: null },
          ...categories,
        ]
      : categories;

  return (
    <>
      <AdminPageHeader
        icon={<FileText className="w-4 h-4" />}
        title={post ? 'Edit Post' : 'New Post'}
        subtitle={post ? post.title : 'Draft a new blog post.'}
        action={
          // form="blog-form" submits the <form> below even though this
          // button lives in the header, outside the form's DOM subtree —
          // standard HTML, not a hack — so Create/Update stays reachable
          // without scrolling a long form, matching how the reference
          // codebase keeps primary actions in the page header.
          <button
            type="submit"
            form={FORM_ID}
            disabled={pending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-colors"
          >
            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {pending ? 'Saving…' : post ? 'Save Changes' : 'Create Post'}
          </button>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        <form id={FORM_ID} action={formAction} className="space-y-4">
          {post && <input type="hidden" name="id" defaultValue={post.id} />}

          {state.error && (
            <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          <CollapsibleSection title="Basic Info">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="title">Title</label>
                  <input id="title" name="title" required defaultValue={post?.title} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="name">Slug (URL)</label>
                  <input
                    id="name"
                    name="name"
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    title="lowercase, kebab-case"
                    defaultValue={post?.name}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="excerpt">
                  Excerpt (meta description — 120–165 chars)
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  required
                  rows={2}
                  defaultValue={post?.excerpt}
                  className={inputCls}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category_id"
                    required
                    defaultValue={String(post?.category_id ?? categoryOptions[0]?.id ?? '')}
                    className={inputCls}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="read_minutes">Read time (minutes)</label>
                  <input
                    id="read_minutes"
                    name="read_minutes"
                    type="number"
                    min={1}
                    defaultValue={post?.read_minutes ?? 5}
                    className={inputCls}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={post?.published ?? true}
                  className="rounded"
                />
                Published (unchecked = draft, hidden from the public site)
              </label>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Cover Image">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="cover_url">
                  Cover image
                  <span className="ml-1 font-normal normal-case text-slate-400">
                    (type a path, or upload to storage)
                  </span>
                </label>
                <CoverImageField name="cover_url" defaultValue={post?.cover_url} />
              </div>
              <div>
                <label className={labelCls} htmlFor="cover_alt">Cover alt text</label>
                <input id="cover_alt" name="cover_alt" required defaultValue={post?.cover_alt} className={inputCls} />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Tags & Author">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="tags">Tags (comma-separated)</label>
                  <input id="tags" name="tags" defaultValue={post?.tags.join(', ')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="keywords">Keywords (comma-separated)</label>
                  <input
                    id="keywords"
                    name="keywords"
                    defaultValue={post?.keywords.join(', ')}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="author_name">Author name</label>
                  <input
                    id="author_name"
                    name="author_name"
                    defaultValue={post?.author_name ?? 'IFFCO Kisan SEZ Team'}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="author_role">Author role (optional)</label>
                  <input
                    id="author_role"
                    name="author_role"
                    defaultValue={post?.author_role ?? ''}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Content">
            <BodyEditor defaultValue={blocksToText(post?.body)} />
          </CollapsibleSection>

          <CollapsibleSection title="FAQs (optional)" defaultOpen={Boolean(post?.data?.faqs?.length)}>
            <FaqEditor defaultValue={faqsToText(post?.data?.faqs)} />
          </CollapsibleSection>
        </form>
      </div>
    </>
  );
}

// Plain-text editor for optional per-post FAQs, same "one text field, no
// dynamic add/remove row state" convention as BodyEditor above — see
// src/lib/blogFaq.ts for the "Q: .../A: ..." format this parses. Left empty,
// no FAQ section renders on the post or in its JSON-LD.
function FaqEditor({ defaultValue }: { defaultValue: string }) {
  return (
    <div className="space-y-2">
      <label className={labelCls} htmlFor="faqs">
        FAQs — blank line between pairs, prefix lines with{' '}
        <code className="text-primary-600 dark:text-primary-500 normal-case">Q:</code> and{' '}
        <code className="text-primary-600 dark:text-primary-500 normal-case">A:</code>
      </label>
      <textarea
        id="faqs"
        name="faqs"
        rows={8}
        defaultValue={defaultValue}
        placeholder={'Q: Does a custom build always cost more?\nA: Usually more upfront, not necessarily over time.'}
        className={`${inputCls} font-mono text-xs leading-relaxed`}
      />
    </div>
  );
}

type BodyMode = 'write' | 'preview';

// Write/Preview toggle for the body textarea. "Preview" renders the same
// paragraph/heading split BlogPostPage.tsx uses on the live site (### prefix
// -> <h2>, blank line -> new <p>), so an author can see the actual rendered
// output without leaving the admin panel. The textarea unmounts while in
// preview mode, so its value is lifted to state here (rather than
// defaultValue) and resubmitted via a hidden input under the same `body`
// name — only one of the two is ever rendered at a time.
function BodyEditor({ defaultValue }: { defaultValue: string }) {
  const [mode, setMode] = React.useState<BodyMode>('write');
  const [text, setText] = React.useState(defaultValue);
  const blocks = React.useMemo(() => textToBlocks(text), [text]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className={labelCls} htmlFor="body">
          Body — blank line between paragraphs, prefix a line with{' '}
          <code className="text-primary-600 dark:text-primary-500 normal-case">### </code> for a subheading.{' '}
          Inline <code className="text-primary-600 dark:text-primary-500 normal-case">**bold**</code>,{' '}
          <code className="text-primary-600 dark:text-primary-500 normal-case">*italic*</code>,{' '}
          <code className="text-primary-600 dark:text-primary-500 normal-case">`code`</code>, and pipe tables (
          <code className="text-primary-600 dark:text-primary-500 normal-case">| a | b |</code> with a{' '}
          <code className="text-primary-600 dark:text-primary-500 normal-case">|---|---|</code> row) are supported.
        </label>
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
              mode === 'write'
                ? 'bg-primary-600 text-white'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Code className="w-3 h-3" />
            Code
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
              mode === 'preview'
                ? 'bg-primary-600 text-white'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
        </div>
      </div>

      {mode === 'write' ? (
        <textarea
          id="body"
          name="body"
          required
          rows={20}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`${inputCls} font-mono text-xs leading-relaxed`}
        />
      ) : (
        <>
          <input type="hidden" name="body" value={text} />
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-5 min-h-[420px] prose dark:prose-invert max-w-none space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {blocks.length === 0 ? (
              <p className="text-slate-400">Nothing to preview yet.</p>
            ) : (
              <BlogBody blocks={blocks} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
