'use client';

import React from 'react';
import Image from 'next/image';
import { Upload, Loader2, Trash2, Copy, Check, Search, Globe, Lock, File as FileIconLucide } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MEDIA_TYPES, getMediaType, withMediaType, type MediaType } from '@/lib/mediaTypes';
import { MediaUploadDialog } from './MediaUploadDialog';

const BUCKET = 'website-media';

export interface MediaRow {
  id: number;
  file_name: string;
  storage_path: string;
  url: string;
  mime_type: string | null;
  size_bytes: number | null;
  alt_text: string | null;
  is_public: boolean;
  tags: string[] | null;
  link_url: string | null;
  sort_order: number | null;
  created_at: string;
}

interface RpcEnvelope<T> {
  is_success: boolean;
  data: T;
  message: string;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Direct client-side storage upload + RPC calls (no server action), same
// pattern CoverImageField.tsx already established for blog covers — instant
// per-file feedback (progress/errors) beats a full-page form submission for
// a multi-file gallery like this.
export function MediaLibrary({ initialMedia }: { initialMedia: MediaRow[] }) {
  const [media, setMedia] = React.useState(initialMedia);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [typeFilter, setTypeFilter] = React.useState<MediaType | 'all'>('all');
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);

  // fn_save_website_media is a full upsert, so every edit resends the whole
  // row with just the changed fields patched in.
  async function saveItem(item: MediaRow, patch: Partial<Pick<MediaRow, 'alt_text' | 'is_public' | 'tags' | 'link_url' | 'sort_order'>>) {
    const next = { ...item, ...patch };
    const supabase = createClient();
    const { data: envelope, error: rpcError } = await supabase.rpc('fn_save_website_media', {
      p_id: item.id,
      p_file_name: next.file_name,
      p_storage_path: next.storage_path,
      p_url: next.url,
      p_mime_type: next.mime_type,
      p_size_bytes: next.size_bytes,
      p_alt_text: next.alt_text,
      p_is_public: next.is_public,
      p_tags: next.tags,
      p_link_url: next.link_url,
      p_sort_order: next.sort_order,
    });
    const result = envelope as RpcEnvelope<MediaRow[]> | null;
    if (rpcError || !result?.is_success) {
      setError(result?.message ?? rpcError?.message ?? 'Update failed');
      return;
    }
    setError(null);
    setMedia((prev) => prev.map((m) => (m.id === item.id ? next : m)));
  }

  function handleToggleVisibility(item: MediaRow) {
    return saveItem(item, { is_public: !item.is_public });
  }

  function handleTypeChange(item: MediaRow, type: MediaType) {
    return saveItem(item, { tags: withMediaType(item.tags, type) });
  }

  function handleAltTextBlur(item: MediaRow, value: string) {
    const nextAlt = value.trim() || null;
    if (nextAlt === item.alt_text) return;
    return saveItem(item, { alt_text: nextAlt });
  }

  function handleLinkUrlBlur(item: MediaRow, value: string) {
    const nextLink = value.trim() || null;
    if (nextLink === item.link_url) return;
    if (nextLink && !/^https?:\/\//i.test(nextLink)) {
      setError(`${item.file_name}: website link must start with http:// or https://`);
      return;
    }
    return saveItem(item, { link_url: nextLink });
  }

  function handleSortOrderBlur(item: MediaRow, value: string) {
    const nextOrder = value.trim() === '' ? null : Math.trunc(Number(value));
    if (nextOrder !== null && !Number.isFinite(nextOrder)) return;
    if (nextOrder === item.sort_order) return;
    return saveItem(item, { sort_order: nextOrder });
  }

  async function handleDelete(item: MediaRow) {
    setDeletingId(item.id);
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([item.storage_path]);
    const { error: rpcError } = await supabase.rpc('fn_delete_website_media', { p_id: item.id });
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
  }

  function handleCopy(item: MediaRow) {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Same order as fn_get_website_media (and the home page): sort order first,
  // unnumbered items after, newest first — re-applied here so an edited
  // sort order moves the card straight away.
  const filtered = [...media].sort(
    (a, b) =>
      (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity) || b.created_at.localeCompare(a.created_at),
  ).filter((m) => {
    if (typeFilter !== 'all' && getMediaType(m.tags) !== typeFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.file_name.toLowerCase().includes(q) || (m.alt_text ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary-500 transition"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MediaType | 'all')}
          aria-label="Filter by type"
          className="shrink-0 px-2.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary-500"
        >
          <option value="all">All types</option>
          {MEDIA_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>

      {typeFilter === 'company-logo' && (
        <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5">
          Public company logos appear in the &ldquo;Our Customers&rdquo; strip on the home page. Put the company name in
          the alt text, an optional website link, and an order number (lower shows first). Transparent PNG or SVG
          files work best.
        </p>
      )}

      <MediaUploadDialog
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(row) => setMedia((prev) => [row, ...prev])}
      />

      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12">
          {media.length === 0 ? 'No media yet — upload your first file.' : 'No files match your search.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="relative aspect-square bg-slate-50 dark:bg-slate-950">
                {item.mime_type?.startsWith('image/') ? (
                  // crossOrigin: same fix as LazyImage.tsx/CoverImageField.tsx — this
                  // bucket allows SVG uploads (unlike blog-covers' raster-only
                  // restriction), and next/image serves .svg as a raw cross-origin
                  // <img> rather than proxying it same-origin like raster formats.
                  // Without this, the site's Cross-Origin-Embedder-Policy:
                  // require-corp blocks it since Supabase Storage doesn't send its
                  // own Cross-Origin-Resource-Policy header.
                  <Image
                    src={item.url}
                    alt={item.alt_text ?? item.file_name}
                    fill
                    crossOrigin="anonymous"
                    className={getMediaType(item.tags) === 'company-logo' ? 'object-contain p-3' : 'object-cover'}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                    <FileIconLucide className="w-8 h-8" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item)}
                  title={item.is_public ? 'Public — click to make private' : 'Private — click to make public'}
                  className={`absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide transition-colors ${
                    item.is_public ? 'bg-emerald-500/90 text-white hover:bg-emerald-500' : 'bg-slate-700/90 text-white hover:bg-slate-700'
                  }`}
                >
                  {item.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                  {item.is_public ? 'Public' : 'Private'}
                </button>
              </div>
              <div className="p-2.5 space-y-1.5">
                <p
                  className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate"
                  title={item.file_name}
                >
                  {item.file_name}
                </p>
                <p className="text-[10px] text-slate-400">{formatBytes(item.size_bytes)}</p>
                <select
                  value={getMediaType(item.tags)}
                  onChange={(e) => handleTypeChange(item, e.target.value as MediaType)}
                  aria-label="Media type"
                  className="w-full px-1 py-1 rounded-md text-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary-500"
                >
                  {MEDIA_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder={getMediaType(item.tags) === 'company-logo' ? 'Company name (alt text)' : 'Alt text'}
                  aria-label="Alt text"
                  defaultValue={item.alt_text ?? ''}
                  onBlur={(e) => handleAltTextBlur(item, e.target.value)}
                  className="w-full px-1.5 py-1 rounded-md text-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary-500"
                />
                {getMediaType(item.tags) === 'company-logo' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="url"
                      placeholder="Website link"
                      aria-label="Website link"
                      defaultValue={item.link_url ?? ''}
                      onBlur={(e) => handleLinkUrlBlur(item, e.target.value)}
                      className="min-w-0 flex-1 px-1.5 py-1 rounded-md text-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="number"
                      step={1}
                      placeholder="Order"
                      aria-label="Sort order (lower shows first)"
                      title="Sort order — lower shows first; blank goes last"
                      defaultValue={item.sort_order ?? ''}
                      onBlur={(e) => handleSortOrderBlur(item, e.target.value)}
                      className="w-14 shrink-0 px-1.5 py-1 rounded-md text-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedId === item.id ? 'Copied' : 'Copy URL'}
                  </button>
                  {confirmDeleteId === item.id ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500 hover:bg-red-400 text-white transition-colors"
                    >
                      {deletingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      title="Delete"
                      className="px-2 py-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
