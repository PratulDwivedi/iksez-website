'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ExternalLink,
  EyeOff,
  File,
  FileText,
  Languages,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { deleteNavItem, reorderNavItems, saveNavItem } from '@/app/admin/(protected)/navigation/actions';
import type { AdminNavItem, NavItemInput, NavTranslationInput } from '@/lib/adminNav';
import { translationLocales, type TranslationLocale } from '@/lib/blogTranslations';
import { localeLabels } from '@/lib/i18n/config';
import { slugify, type NavKind } from '@/lib/navTree';
import { RichTextEditor } from './RichTextEditor';
import { PdfUploadField } from './PdfUploadField';
import { ParentTreeSelect } from './ParentTreeSelect';

// Same field typography as BlogForm and the other admin forms.
const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:outline-none focus:border-primary-500 transition';
const labelCls =
  'text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block';
const hintCls = 'mt-1.5 text-[11px] text-slate-400';
const checkboxLabelCls = 'flex items-start gap-2 text-xs font-bold text-slate-600 dark:text-slate-400';

const Required = () => <span className="text-red-500 normal-case">&nbsp;*</span>;

const KINDS: { kind: NavKind; label: string; hint: string; icon: React.ReactNode }[] = [
  { kind: 'page', label: 'Page', hint: 'Content written here, with its sub-items listed below it', icon: <FileText className="w-4 h-4" /> },
  { kind: 'document', label: 'Document', hint: 'A PDF that opens when clicked', icon: <File className="w-4 h-4" /> },
  { kind: 'link', label: 'Link', hint: 'Goes to an existing page of the site or another website', icon: <Link2 className="w-4 h-4" /> },
];

const KIND_ICON: Record<NavKind, React.ReactNode> = {
  page: <FileText className="w-3.5 h-3.5" />,
  document: <File className="w-3.5 h-3.5 text-red-500" />,
  link: <Link2 className="w-3.5 h-3.5" />,
};

type Tab = 'en' | TranslationLocale;

type Selection = { mode: 'edit'; id: number } | { mode: 'new'; parentId: number | null };

function childrenMap(items: AdminNavItem[]) {
  const map = new Map<number | null, AdminNavItem[]>();
  for (const item of items) {
    const list = map.get(item.parent_id) ?? [];
    list.push(item);
    map.set(item.parent_id, list);
  }
  for (const list of map.values()) list.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  return map;
}

function descendantIds(id: number, children: Map<number | null, AdminNavItem[]>): number[] {
  return (children.get(id) ?? []).flatMap((child) => [child.id, ...descendantIds(child.id, children)]);
}

function blankTranslation(locale: TranslationLocale): NavTranslationInput {
  return { locale, title: '', description: '', body_html: '', file_path: null, file_name: null, published: true };
}

function draftFor(selection: Selection, items: AdminNavItem[]): NavItemInput {
  if (selection.mode === 'new') {
    return {
      id: null,
      parent_id: selection.parentId,
      slug: '',
      kind: 'page',
      title: '',
      description: '',
      href: '',
      body_html: '',
      file_path: null,
      file_name: null,
      open_in_new_tab: false,
      show_in_menu: true,
      published: true,
      translations: translationLocales.map(blankTranslation),
    };
  }
  const item = items.find((i) => i.id === selection.id)!;
  return {
    id: item.id,
    parent_id: item.parent_id,
    slug: item.slug,
    kind: item.kind,
    title: item.title,
    description: item.description ?? '',
    href: item.href ?? '',
    body_html: item.body_html ?? '',
    file_path: item.file_path,
    file_name: item.file_name,
    open_in_new_tab: item.open_in_new_tab,
    show_in_menu: item.show_in_menu,
    published: item.published,
    translations: translationLocales.map((locale) => {
      const t = item.translations.find((tr) => tr.locale === locale);
      return t
        ? {
            locale,
            title: t.title,
            description: t.description ?? '',
            body_html: t.body_html ?? '',
            file_path: t.file_path,
            file_name: t.file_name,
            published: t.published,
          }
        : blankTranslation(locale);
    }),
  };
}

export function NavigationManager({ items }: { items: AdminNavItem[] }) {
  const router = useRouter();
  const children = React.useMemo(() => childrenMap(items), [items]);
  const byId = React.useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const [selection, setSelection] = React.useState<Selection | null>(null);
  const [draft, setDraft] = React.useState<NavItemInput | null>(null);
  // Bumped on every selection; keys the rich-text editors so they remount
  // with the newly selected item's content.
  const [editorKey, setEditorKey] = React.useState(0);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>('en');
  const [collapsed, setCollapsed] = React.useState<Set<number>>(() => new Set());
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [reordering, setReordering] = React.useState(false);

  function select(next: Selection) {
    setSelection(next);
    setDraft(draftFor(next, items));
    setEditorKey((k) => k + 1);
    setSlugTouched(next.mode === 'edit');
    setTab('en');
    setMessage(null);
    setConfirmDelete(false);
  }

  const update = (patch: Partial<NavItemInput>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const updateTranslation = (locale: TranslationLocale, patch: Partial<NavTranslationInput>) =>
    setDraft((d) =>
      d ? { ...d, translations: d.translations.map((t) => (t.locale === locale ? { ...t, ...patch } : t)) } : d
    );

  // URL of an item: its ancestors' slugs, then its own.
  const pathOf = (parentId: number | null, slug: string) => {
    const parts = [slug];
    let current = parentId === null ? undefined : byId.get(parentId);
    while (current) {
      parts.unshift(current.slug);
      current = current.parent_id === null ? undefined : byId.get(current.parent_id);
    }
    return `/${parts.join('/')}/`;
  };

  async function move(item: AdminNavItem, direction: -1 | 1) {
    const siblings = children.get(item.parent_id) ?? [];
    const index = siblings.findIndex((s) => s.id === item.id);
    const target = index + direction;
    if (target < 0 || target >= siblings.length) return;
    const ids = siblings.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setReordering(true);
    const result = await reorderNavItems(ids);
    setReordering(false);
    if (result.error) setMessage({ kind: 'error', text: result.error });
    router.refresh();
  }

  async function handleSave() {
    if (!draft) return;
    setPending(true);
    setMessage(null);
    const result = await saveNavItem(draft);
    setPending(false);
    if (result.id && draft.id === null) {
      // Stay on the item that was just created; its row arrives with the refresh.
      setSelection({ mode: 'edit', id: result.id });
      setDraft({ ...draft, id: result.id });
      setSlugTouched(true);
    }
    setMessage(result.error ? { kind: 'error', text: result.error } : { kind: 'success', text: 'Saved. The website is updated.' });
    router.refresh();
  }

  async function handleDelete() {
    if (!draft?.id) return;
    setPending(true);
    const result = await deleteNavItem(draft.id);
    setPending(false);
    if (result.error) {
      setMessage({ kind: 'error', text: result.error });
      return;
    }
    setSelection(null);
    setDraft(null);
    setConfirmDelete(false);
    router.refresh();
  }

  const selectedItem = selection?.mode === 'edit' ? byId.get(selection.id) : undefined;
  const blockedParents = React.useMemo(
    () => new Set(selection?.mode === 'edit' ? [selection.id, ...descendantIds(selection.id, children)] : []),
    [selection, children]
  );
  const deleteCount = selection?.mode === 'edit' ? descendantIds(selection.id, children).length : 0;

  function renderTree(parentId: number | null, depth: number): React.ReactNode {
    const list = children.get(parentId) ?? [];
    return list.map((item, index) => {
      const kids = children.get(item.id) ?? [];
      const isCollapsed = collapsed.has(item.id);
      const isSelected = selection?.mode === 'edit' && selection.id === item.id;
      return (
        <li key={item.id}>
          <div
            className={`group flex items-center gap-1.5 rounded-lg pr-1.5 py-1.5 text-[13px] cursor-pointer transition-colors ${
              isSelected
                ? 'bg-primary-600/10 text-primary-700 dark:text-primary-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            style={{ paddingLeft: `${depth * 18 + 4}px` }}
            onClick={() => select({ mode: 'edit', id: item.id })}
          >
            <button
              type="button"
              aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed((prev) => {
                  const next = new Set(prev);
                  if (next.has(item.id)) next.delete(item.id);
                  else next.add(item.id);
                  return next;
                });
              }}
              className={`p-0.5 rounded text-slate-400 hover:text-slate-700 ${kids.length === 0 ? 'invisible' : ''}`}
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
            </button>
            <span className="text-slate-400 shrink-0">{KIND_ICON[item.kind]}</span>
            <span className={`min-w-0 flex-1 truncate font-semibold ${item.published ? '' : 'text-slate-400'}`}>
              {item.title}
            </span>
            {!item.published && (
              <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Draft</span>
            )}
            {!item.show_in_menu && (
              <span title="Not shown in the header menu" className="shrink-0 text-slate-400">
                <EyeOff className="w-3.5 h-3.5" />
              </span>
            )}
            {kids.length > 0 && isCollapsed && (
              <span className="shrink-0 text-[10px] font-bold text-slate-400">{kids.length}</span>
            )}
            <span className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100">
              <IconButton label="Move up" disabled={index === 0 || reordering} onClick={() => move(item, -1)}>
                <ArrowUp />
              </IconButton>
              <IconButton label="Move down" disabled={index === list.length - 1 || reordering} onClick={() => move(item, 1)}>
                <ArrowDown />
              </IconButton>
              {item.kind !== 'document' && (
                <IconButton label="Add sub-item" onClick={() => select({ mode: 'new', parentId: item.id })}>
                  <Plus />
                </IconButton>
              )}
            </span>
          </div>
          {kids.length > 0 && !isCollapsed && <ul>{renderTree(item.id, depth + 1)}</ul>}
        </li>
      );
    });
  }

  const translationStatus = (locale: TranslationLocale) => {
    const t = draft?.translations.find((tr) => tr.locale === locale);
    if (!t?.title.trim()) return { text: 'Not translated', dot: 'bg-slate-300 dark:bg-slate-600' };
    return t.published
      ? { text: 'Published', dot: 'bg-emerald-500' }
      : { text: 'Draft', dot: 'bg-amber-500' };
  };

  const publicPath = draft && draft.kind !== 'link' && draft.slug ? pathOf(draft.parent_id, draft.slug) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_1fr] items-start">
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 lg:sticky lg:top-20">
        <div className="flex items-center justify-between gap-2 px-1 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Header menu</h2>
            <p className="text-[11px] text-slate-500">Top level = header bar. Hover a row to reorder or add a sub-item.</p>
          </div>
          <button
            type="button"
            onClick={() => select({ mode: 'new', parentId: null })}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        {items.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-slate-500">No menu items yet.</p>
        ) : (
          <ul>{renderTree(null, 0)}</ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {!draft || !selection ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Select an item to edit it</p>
            <p className="mt-1 text-xs text-slate-500">
              or use <strong>Add</strong> to create a menu item, a page with its own content, or a PDF document.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {selection.mode === 'new' ? 'New item' : selectedItem?.title ?? draft.title}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {draft.parent_id === null ? 'Top level' : `Under ${byId.get(draft.parent_id)?.title ?? '…'}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {publicPath && selection.mode === 'edit' && selectedItem?.published && (
                  <a
                    href={publicPath}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[12px] font-bold text-slate-500 hover:text-primary-600"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={pending}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            </div>

            <div className="px-5 pt-3">
              <div role="tablist" className="flex gap-1 border-b border-slate-100 dark:border-slate-800">
                {(['en', ...translationLocales] as Tab[]).map((t) => {
                  const status = t === 'en' ? null : translationStatus(t);
                  return (
                    <button
                      key={t}
                      role="tab"
                      type="button"
                      aria-selected={tab === t}
                      onClick={() => setTab(t)}
                      className={`-mb-px inline-flex items-center gap-1.5 px-3 py-2 border-b-2 text-xs font-bold transition-colors ${
                        tab === t
                          ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {t !== 'en' && <Languages className="w-3.5 h-3.5" />}
                      {localeLabels[t].native}
                      {status && <span title={status.text} className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-5 space-y-5">
              {message && (
                <p
                  className={`text-xs font-semibold rounded-xl px-4 py-3 border ${
                    message.kind === 'error'
                      ? 'text-red-500 bg-red-500/10 border-red-500/20'
                      : 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                  }`}
                >
                  {message.text}
                </p>
              )}

              <div hidden={tab !== 'en'} className="space-y-5">
                <div>
                  <span className={labelCls}>Type</span>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {KINDS.map((k) => {
                      const hasChildren = selection.mode === 'edit' && (children.get(selection.id)?.length ?? 0) > 0;
                      const disabled = k.kind === 'document' && hasChildren;
                      return (
                        <button
                          key={k.kind}
                          type="button"
                          disabled={disabled}
                          title={disabled ? 'An item with sub-items can’t be a document' : undefined}
                          onClick={() =>
                            // New documents open in a new tab by default; new links don't.
                            update(selection.mode === 'new' ? { kind: k.kind, open_in_new_tab: k.kind === 'document' } : { kind: k.kind })
                          }
                          className={`text-left rounded-xl border px-3 py-2.5 transition-colors disabled:opacity-40 ${
                            draft.kind === k.kind
                              ? 'border-primary-500 bg-primary-600/5'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800 dark:text-slate-100">
                            {k.icon} {k.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{k.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title, slug and parent on one row on wide screens; the parent
                    drops to its own full-width row when there's no room. */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="nav-title">
                      Menu text / title<Required />
                    </label>
                    <input
                      id="nav-title"
                      value={draft.title}
                      onChange={(e) =>
                        update(
                          slugTouched ? { title: e.target.value } : { title: e.target.value, slug: slugify(e.target.value) }
                        )
                      }
                      placeholder="e.g. Annual Reports, 2024-25"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="nav-slug">
                      Slug<Required />
                    </label>
                    <input
                      id="nav-slug"
                      value={draft.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        update({ slug: e.target.value.toLowerCase() });
                      }}
                      className={`${inputCls} font-mono`}
                    />
                    <p className={hintCls}>
                      {publicPath ? (
                        <>
                          Web address: <span className="font-mono">{publicPath}</span>
                        </>
                      ) : (
                        'Identifies the item; used in the web address of pages and documents.'
                      )}
                    </p>
                  </div>
                  <div className="sm:col-span-2 xl:col-span-1">
                    <label className={labelCls} htmlFor="nav-parent">
                      Parent
                    </label>
                    <ParentTreeSelect
                      id="nav-parent"
                      items={items}
                      value={draft.parent_id}
                      excluded={blockedParents}
                      onChange={(parentId) => update({ parent_id: parentId })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls} htmlFor="nav-description">
                    Description
                  </label>
                  <textarea
                    id="nav-description"
                    rows={2}
                    value={draft.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="One line about this section, e.g. Year-wise annual reports and organisational disclosures."
                    className={`${inputCls} resize-y`}
                  />
                  <p className={hintCls}>
                    Shown under the title in the page header, and under this item where its parent page lists it.
                  </p>
                </div>

                {draft.kind === 'link' && (
                  <div>
                    <label className={labelCls} htmlFor="nav-href">
                      Route or URL<Required />
                    </label>
                    <input
                      id="nav-href"
                      value={draft.href}
                      onChange={(e) => update({ href: e.target.value })}
                      placeholder="/about-us/ or https://example.com"
                      className={`${inputCls} font-mono`}
                    />
                    <p className={hintCls}>
                      A route of this site starts with “/” and opens in the visitor’s language automatically.
                    </p>
                    {selection.mode === 'edit' && (children.get(selection.id)?.length ?? 0) > 0 && (
                      <p className="mt-2 text-[11px] font-semibold text-amber-600">
                        A link has no page of its own, so its sub-items only appear in the header menu. Make it a Page to
                        also list them on a page.
                      </p>
                    )}
                  </div>
                )}

                {draft.kind === 'page' && (
                  <div>
                    <span className={labelCls}>Page content</span>
                    <RichTextEditor
                      key={`${editorKey}-en`}
                      value={draft.body_html}
                      onChange={(html) => update({ body_html: html })}
                    />
                    <p className={hintCls}>
                      Sub-items of this page are listed below the content automatically: sub-pages as cards, documents as PDF
                      links.
                    </p>
                  </div>
                )}

                {draft.kind === 'document' && (
                  <div>
                    <span className={labelCls}>
                      PDF (English)<Required />
                    </span>
                    <PdfUploadField
                      value={{ file_path: draft.file_path, file_name: draft.file_name }}
                      savedPath={selectedItem?.file_path ?? null}
                      onChange={(v) => update(v)}
                    />
                  </div>
                )}

                <div className="space-y-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 px-4 py-3">
                  {draft.kind !== 'page' && (
                    <label className={checkboxLabelCls}>
                      <input
                        type="checkbox"
                        checked={draft.open_in_new_tab}
                        onChange={(e) => update({ open_in_new_tab: e.target.checked })}
                        className="mt-0.5 rounded"
                      />
                      <span>
                        Open in a new browser tab
                        {draft.kind === 'document' && <span className="block font-normal text-slate-400">Recommended for PDFs.</span>}
                      </span>
                    </label>
                  )}
                  <label className={checkboxLabelCls}>
                    <input
                      type="checkbox"
                      checked={draft.show_in_menu}
                      onChange={(e) => update({ show_in_menu: e.target.checked })}
                      className="mt-0.5 rounded"
                    />
                    <span>
                      Show in the header menu
                      <span className="block font-normal text-slate-400">
                        The header shows three levels (bar, dropdown, side flyout). Deeper items, or items with this off,
                        appear only on their parent page.
                      </span>
                    </span>
                  </label>
                  <label className={checkboxLabelCls}>
                    <input
                      type="checkbox"
                      checked={draft.published}
                      onChange={(e) => update({ published: e.target.checked })}
                      className="mt-0.5 rounded"
                    />
                    <span>
                      Published
                      <span className="block font-normal text-slate-400">Unpublishing also hides everything under this item.</span>
                    </span>
                  </label>
                </div>
              </div>

              {translationLocales.map((locale) => {
                const t = draft.translations.find((tr) => tr.locale === locale)!;
                const savedTranslation = selectedItem?.translations.find((tr) => tr.locale === locale);
                const language = localeLabels[locale].english;
                return (
                  <div key={locale} hidden={tab !== locale} className="space-y-5">
                    <p className="text-[12px] text-slate-500">
                      Anything left empty here shows the English version on the {language} website. Clear the title to remove
                      the {language} translation.
                    </p>
                    <div>
                      <label className={labelCls} htmlFor={`nav-title-${locale}`}>
                        Menu text / title ({language})
                      </label>
                      <input
                        id={`nav-title-${locale}`}
                        lang={locale}
                        value={t.title}
                        onChange={(e) => updateTranslation(locale, { title: e.target.value })}
                        placeholder={draft.title}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor={`nav-description-${locale}`}>
                        Description ({language})
                      </label>
                      <textarea
                        id={`nav-description-${locale}`}
                        lang={locale}
                        rows={2}
                        value={t.description}
                        onChange={(e) => updateTranslation(locale, { description: e.target.value })}
                        placeholder={draft.description}
                        className={`${inputCls} resize-y`}
                      />
                    </div>

                    {draft.kind === 'page' && (
                      <div>
                        <span className={labelCls}>Page content ({language})</span>
                        <RichTextEditor
                          key={`${editorKey}-${locale}`}
                          value={t.body_html}
                          onChange={(html) => updateTranslation(locale, { body_html: html })}
                          placeholder={`Leave empty to show the English content`}
                        />
                      </div>
                    )}

                    {draft.kind === 'document' && (
                      <div>
                        <span className={labelCls}>PDF ({language}, optional)</span>
                        <PdfUploadField
                          value={{ file_path: t.file_path, file_name: t.file_name }}
                          savedPath={savedTranslation?.file_path ?? null}
                          onChange={(v) => updateTranslation(locale, v)}
                          emptyHint={`No ${language} PDF: visitors get the English PDF, marked “English PDF”.`}
                        />
                      </div>
                    )}

                    <label className={checkboxLabelCls}>
                      <input
                        type="checkbox"
                        checked={t.published}
                        onChange={(e) => updateTranslation(locale, { published: e.target.checked })}
                        className="mt-0.5 rounded"
                      />
                      <span>
                        {language} translation published
                        <span className="block font-normal text-slate-400">While unpublished, the English version is shown.</span>
                      </span>
                    </label>
                  </div>
                );
              })}

              {selection.mode === 'edit' && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {confirmDelete ? (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                      <p className="flex-1 text-xs font-semibold text-red-600">
                        Delete “{selectedItem?.title}”
                        {deleteCount > 0 && ` and the ${deleteCount} item${deleteCount === 1 ? '' : 's'} under it`}? Their PDFs are
                        deleted too.
                      </p>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={pending}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete item
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none [&_svg]:w-3.5 [&_svg]:h-3.5"
    >
      {children}
    </button>
  );
}
