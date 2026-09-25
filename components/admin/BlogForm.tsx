'use client';

import React from 'react';
import { useActionState } from 'react';
import { FileText, Loader2, Code, Eye, Languages } from 'lucide-react';
import { saveBlogPost } from '@/app/admin/(protected)/blogs/actions';
import { blocksToText, textToBlocks, type BlogBlock } from '@/lib/blogBody';
import { faqsToText, type FaqItem } from '@/lib/blogFaq';
import { AdminPageHeader } from './AdminPageHeader';
import { CollapsibleSection } from './CollapsibleSection';
import { CoverImageField } from './CoverImageField';
import { BlogBody } from '../BlogBody';
import type { QuickListItem } from '@/lib/quickLists';
import {
  translationField,
  translationLocales,
  type BlogTranslation,
  type TranslationLocale,
} from '@/lib/blogTranslations';
import { localeLabels } from '@/lib/i18n/config';

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

// Marks a label's field as required — kept as one shared span so every
// required field gets the same mark rather than each label hand-rolling it.
const Required = () => <span className="text-red-500 normal-case">&nbsp;*</span>;

const FORM_ID = 'blog-form';

type Tab = 'en' | TranslationLocale;

export function BlogForm({
  post,
  categories,
  translations = [],
  initialError = null,
}: {
  post?: BlogFormPost;
  categories: QuickListItem[];
  translations?: BlogTranslation[];
  initialError?: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveBlogPost, { error: initialError });
  const [tab, setTab] = React.useState<Tab>('en');

  // Every tab's inputs stay mounted (only hidden) so one submit saves them
  // all. When the browser blocks submit on an invalid field in a hidden tab,
  // switch to that tab so its validation bubble is actually visible.
  const revealInvalidField = (e: React.FormEvent<HTMLFormElement>) => {
    const pane = (e.target as HTMLElement).closest<HTMLElement>('[data-pane]')?.dataset.pane as Tab | undefined;
    if (pane && pane !== tab) setTab(pane);
  };

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
        <form id={FORM_ID} action={formAction} onInvalidCapture={revealInvalidField} className="space-y-4">
          {post && <input type="hidden" name="id" defaultValue={post.id} />}

          {state.error && (
            <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          <LanguageTabs tab={tab} onChange={setTab} translations={translations} />

          <div data-pane="en" hidden={tab !== 'en'} className="space-y-4">
            <CollapsibleSection title="Basic Info">
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="title">Title<Required /></label>
                    <input id="title" name="title" required defaultValue={post?.title} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="name">Slug (URL)<Required /></label>
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
                    Excerpt (meta description — 120–165 chars)<Required />
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
                    <label className={labelCls} htmlFor="category">Category<Required /></label>
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
                  <label className={labelCls} htmlFor="cover_alt">Cover alt text<Required /></label>
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
          </div>

          {translationLocales.map((locale) => (
            <div key={locale} data-pane={locale} hidden={tab !== locale} className="space-y-4">
              <TranslationPane
                locale={locale}
                translation={translations.find((t) => t.locale === locale)}
                english={post}
              />
            </div>
          ))}
        </form>
      </div>
    </>
  );
}

type TranslationStatus = 'missing' | 'draft' | 'published';

const STATUS: Record<TranslationStatus, { text: string; dot: string }> = {
  missing: { text: 'Not translated', dot: 'bg-slate-300 dark:bg-slate-600' },
  draft: { text: 'Draft', dot: 'bg-amber-500' },
  published: { text: 'Published', dot: 'bg-emerald-500' },
};

function translationStatus(t?: BlogTranslation): TranslationStatus {
  return !t ? 'missing' : t.published ? 'published' : 'draft';
}

// English | తెలుగు · Not translated | ... switcher above the form. Each
// translation tab spells out its status as last saved, so an admin can see
// at a glance what's missing without hovering or opening the tab.
function LanguageTabs({
  tab,
  onChange,
  translations,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
  translations: BlogTranslation[];
}) {
  const tabCls = (active: boolean) =>
    `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
      active ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
    }`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Languages className="w-4 h-4 text-slate-400" aria-hidden="true" />
      <div role="tablist" className="flex items-center gap-0.5 flex-wrap rounded-xl border border-slate-200 dark:border-slate-800 p-0.5">
        <button type="button" role="tab" aria-selected={tab === 'en'} onClick={() => onChange('en')} className={tabCls(tab === 'en')}>
          English
        </button>
        {translationLocales.map((locale) => {
          const status = STATUS[translationStatus(translations.find((x) => x.locale === locale))];
          return (
            <button
              key={locale}
              type="button"
              role="tab"
              aria-selected={tab === locale}
              onClick={() => onChange(locale)}
              className={tabCls(tab === locale)}
            >
              <span lang={locale}>{localeLabels[locale].native}</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold opacity-80">
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                {status.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Read-only copy of the saved English text, shown beside each translation
// field so a translator never has to flip back to the English tab.
function EnglishReference({ text, mono = false, tall = false }: { text?: string; mono?: boolean; tall?: boolean }) {
  return (
    <div
      lang="en"
      className={`rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 px-3 py-2.5 text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words overflow-auto ${
        mono ? 'font-mono text-xs leading-relaxed' : 'text-[13px]'
      } ${tall ? 'max-h-[520px]' : 'max-h-48'}`}
    >
      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1 font-sans">
        English
      </span>
      {text ? text : <span className="italic text-slate-400">—</span>}
    </div>
  );
}

// One translatable field: English reference on the left, the translation
// input on the right (stacked on narrow screens).
function TranslateRow({
  label,
  htmlFor,
  english,
  mono,
  tall,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  english?: string;
  mono?: boolean;
  tall?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className={labelCls} htmlFor={htmlFor}>
          {label}
        </label>
      )}
      <div className="grid lg:grid-cols-2 gap-3 items-start">
        <EnglishReference text={english} mono={mono} tall={tall} />
        <div>{children}</div>
      </div>
    </div>
  );
}

// One locale's copy of the reader-facing fields. Everything else (slug,
// category, cover image, tags, author, dates) is shared with English. No
// field here is `required`: a translation is optional, and saveBlogPost
// rejects a half-filled one (and removes one whose fields were all cleared).
function TranslationPane({
  locale,
  translation,
  english,
}: {
  locale: TranslationLocale;
  translation?: BlogTranslation;
  // The saved English post; undefined while creating a new one.
  english?: BlogFormPost;
}) {
  const field = (name: string) => translationField(locale, name);
  const label = localeLabels[locale];

  return (
    <>
      <input type="hidden" name={field('existed')} value={translation ? '1' : ''} />

      <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 rounded-xl px-4 py-3 leading-relaxed">
        {label.english} version of this post, with the English text alongside for reference. Slug, category,
        cover image, tags and author are shared with English. Leave every field empty to show the English post
        on the {label.english} site instead (clearing a saved translation removes it).
        {!english && ' The English reference appears once the post has been saved.'}
      </p>

      <CollapsibleSection title={`Basic Info — ${label.english}`}>
        <div className="space-y-4">
          <TranslateRow label="Title" htmlFor={field('title')} english={english?.title}>
            <input
              id={field('title')}
              name={field('title')}
              lang={locale}
              defaultValue={translation?.title}
              className={inputCls}
            />
          </TranslateRow>

          <TranslateRow label="Excerpt (meta description)" htmlFor={field('excerpt')} english={english?.excerpt}>
            <textarea
              id={field('excerpt')}
              name={field('excerpt')}
              lang={locale}
              rows={3}
              defaultValue={translation?.excerpt}
              className={inputCls}
            />
          </TranslateRow>

          <TranslateRow
            label={
              <>
                Cover alt text
                <span className="ml-1 font-normal normal-case text-slate-400">(optional — English is used if empty)</span>
              </>
            }
            htmlFor={field('cover_alt')}
            english={english?.cover_alt}
          >
            <input
              id={field('cover_alt')}
              name={field('cover_alt')}
              lang={locale}
              defaultValue={translation?.cover_alt ?? ''}
              className={inputCls}
            />
          </TranslateRow>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              name={field('published')}
              defaultChecked={translation?.published ?? true}
              className="rounded"
            />
            Published (unchecked = draft; the {label.english} site shows the English post until it&rsquo;s published)
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={`Content — ${label.english}`}>
        <TranslateRow label={null} english={blocksToText(english?.body)} mono tall>
          <BodyEditor
            defaultValue={blocksToText(translation?.body)}
            name={field('body')}
            required={false}
            help="Same format as English: blank line between paragraphs, ### for a subheading, - or 1. at the start of lines for a list."
          />
        </TranslateRow>
      </CollapsibleSection>

      <CollapsibleSection
        title={`FAQs — ${label.english} (optional)`}
        defaultOpen={Boolean(translation?.data?.faqs?.length || english?.data?.faqs?.length)}
      >
        <TranslateRow label={null} english={faqsToText(english?.data?.faqs)} mono>
          <FaqEditor defaultValue={faqsToText(translation?.data?.faqs ?? undefined)} name={field('faqs')} />
        </TranslateRow>
      </CollapsibleSection>
    </>
  );
}

// Plain-text editor for optional per-post FAQs, same "one text field, no
// dynamic add/remove row state" convention as BodyEditor above — see
// src/lib/blogFaq.ts for the "Q: .../A: ..." format this parses. Left empty,
// no FAQ section renders on the post or in its JSON-LD.
function FaqEditor({ defaultValue, name = 'faqs' }: { defaultValue: string; name?: string }) {
  return (
    <div className="space-y-2">
      <label className={labelCls} htmlFor={name}>
        FAQs — blank line between pairs, prefix lines with{' '}
        <code className="text-primary-600 dark:text-primary-500 normal-case">Q:</code> and{' '}
        <code className="text-primary-600 dark:text-primary-500 normal-case">A:</code>
      </label>
      <textarea
        id={name}
        name={name}
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
// `name` defaults to the English "body"; translation tabs pass their own
// (tr_te_body) and required={false}, since an empty translation is valid —
// saveBlogPost checks that a *started* translation is complete instead.
// `help` replaces the full formatting instructions with a short line, for
// the half-width translation column where the long version would wrap badly.
function BodyEditor({
  defaultValue,
  name = 'body',
  required = true,
  help,
}: {
  defaultValue: string;
  name?: string;
  required?: boolean;
  help?: string;
}) {
  const [mode, setMode] = React.useState<BodyMode>('write');
  const [text, setText] = React.useState(defaultValue);
  const blocks = React.useMemo(() => textToBlocks(text), [text]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className={labelCls} htmlFor={name}>
          Body{required && <Required />} —{' '}
          {help ?? (
            <>
              blank line between paragraphs, prefix a line with{' '}
              <code className="text-primary-600 dark:text-primary-500 normal-case">### </code> for a subheading.{' '}
              Start lines with <code className="text-primary-600 dark:text-primary-500 normal-case">- </code> or{' '}
              <code className="text-primary-600 dark:text-primary-500 normal-case">1. </code> for a list.{' '}
              Inline <code className="text-primary-600 dark:text-primary-500 normal-case">**bold**</code>,{' '}
              <code className="text-primary-600 dark:text-primary-500 normal-case">*italic*</code>,{' '}
              <code className="text-primary-600 dark:text-primary-500 normal-case">`code`</code>, and pipe tables (
              <code className="text-primary-600 dark:text-primary-500 normal-case">| a | b |</code> with a{' '}
              <code className="text-primary-600 dark:text-primary-500 normal-case">|---|---|</code> row) are supported.
            </>
          )}
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
          id={name}
          name={name}
          required={required}
          rows={20}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`${inputCls} font-mono text-xs leading-relaxed`}
        />
      ) : (
        <>
          <input type="hidden" name={name} value={text} />
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
