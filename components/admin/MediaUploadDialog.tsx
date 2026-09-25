'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Globe, Loader2, Lock, Plus, Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MEDIA_TYPES, withMediaType, type MediaType } from '@/lib/mediaTypes';
import type { MediaRow } from './MediaLibrary';

const BUCKET = 'website-media';
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml', 'image/gif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const FIELD_CLASS =
  'w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-primary-500 transition';
const LABEL_CLASS = 'block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5';

const fileKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Local preview of a not-yet-uploaded file. The object URL is created and
// revoked by the ref itself (React 19 ref cleanup), so it's freed as soon as
// the file is removed from the form or the dialog closes.
function FilePreview({ file, className }: { file: File; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      className={className}
      ref={(img) => {
        if (!img) return;
        const url = URL.createObjectURL(file);
        img.src = url;
        return () => URL.revokeObjectURL(url);
      }}
    />
  );
}

interface RpcEnvelope<T> {
  is_success: boolean;
  data: T;
  message: string;
}

// One form for everything an upload needs — file(s), type, visibility and,
// for a single file, its alt text (plus website link and order for a company
// logo). Multi-file uploads share type/visibility; per-file details are then
// edited on each card in MediaLibrary.
export function MediaUploadDialog({
  isOpen,
  onClose,
  onUploaded,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (row: MediaRow) => void;
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [type, setType] = React.useState<MediaType>('general');
  const [isPublic, setIsPublic] = React.useState(true);
  const [altText, setAltText] = React.useState('');
  const [linkUrl, setLinkUrl] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [dragOver, setDragOver] = React.useState(false);

  const isLogo = type === 'company-logo';
  const single = files.length === 1;

  function reset() {
    setFiles([]);
    setType('general');
    setIsPublic(true);
    setAltText('');
    setLinkUrl('');
    setSortOrder('');
    setErrors([]);
  }

  function close() {
    if (uploading) return;
    reset();
    onClose();
  }

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  function addFiles(list: FileList | null) {
    const next = Array.from(list ?? []);
    const problems: string[] = [];
    const ok = next.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) problems.push(`${f.name}: unsupported file type`);
      else if (f.size > MAX_SIZE_BYTES) problems.push(`${f.name}: larger than 10MB`);
      else return true;
      return false;
    });
    setErrors(problems);
    setFiles((prev) => {
      const seen = new Set(prev.map(fileKey));
      return [...prev, ...ok.filter((f) => !seen.has(fileKey(f)))];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;

    const link = linkUrl.trim();
    if (single && isLogo && link && !/^https?:\/\//i.test(link)) {
      setErrors(['Website link must start with http:// or https://']);
      return;
    }

    setUploading(true);
    setErrors([]);
    const supabase = createClient();
    const failed: File[] = [];
    const problems: string[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      });
      if (uploadError) {
        problems.push(`${file.name}: ${uploadError.message}`);
        failed.push(file);
        continue;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const { data: envelope, error: rpcError } = await supabase.rpc('fn_save_website_media', {
        p_file_name: file.name,
        p_storage_path: path,
        p_url: urlData.publicUrl,
        p_mime_type: file.type,
        p_size_bytes: file.size,
        p_is_public: isPublic,
        p_tags: withMediaType(null, type),
        p_alt_text: single ? altText.trim() || null : null,
        p_link_url: single && isLogo ? link || null : null,
        p_sort_order: single && isLogo && sortOrder.trim() !== '' ? Math.trunc(Number(sortOrder)) : null,
      });

      const result = envelope as RpcEnvelope<MediaRow[]> | null;
      if (rpcError || !result?.is_success) {
        problems.push(`${file.name}: ${rpcError?.message ?? result?.message ?? 'save failed'}`);
        failed.push(file);
        continue;
      }

      onUploaded(result.data[0]);
    }

    setUploading(false);
    if (failed.length === 0) {
      reset();
      onClose();
    } else {
      // Keep only what failed in the form so a retry doesn't re-upload the rest.
      setFiles(failed);
      setErrors(problems);
    }
  }

  if (!isOpen) return null;

  // Portaled for the same reason as ApiIntegrationDialog: an ancestor's
  // backdrop-filter would otherwise trap `fixed inset-0` inside it.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/20 backdrop-blur-[2px]"
      onClick={close}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-upload-title"
        className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
          <h3 id="media-upload-title" className="text-base font-extrabold tracking-tight">
            Upload media
          </h3>
          <button
            type="button"
            onClick={close}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-5 overflow-y-auto space-y-4">
          <div>
            <span className={LABEL_CLASS}>File</span>
            {/* One drop target/picker: a slim bar when empty, a small "+" tile
                beside the thumbnails once files are chosen. */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`rounded-xl transition-colors ${dragOver ? 'bg-primary-500/5 ring-2 ring-primary-500' : ''}`}
            >
              {files.length === 0 ? (
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-500 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold">Choose or drop images</span>
                    <span className="block text-[10px] text-slate-400">PNG, JPG, WebP, AVIF, SVG or GIF · up to 10MB each</span>
                  </span>
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = '';
                    }}
                    className="sr-only"
                  />
                </label>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {files.map((f) => (
                    <li
                      key={fileKey(f)}
                      title={`${f.name} · ${formatBytes(f.size)}`}
                      className="relative w-20 h-20 p-2 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    >
                      <FilePreview file={f} className="max-w-full max-h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                        className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 hover:text-red-500"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                  <li>
                    <label
                      className="w-20 h-20 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-400 hover:text-primary-500 cursor-pointer transition-colors"
                      title="Add more images"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[10px] font-semibold">Add</span>
                      <input
                        type="file"
                        multiple
                        accept={ACCEPTED_TYPES.join(',')}
                        onChange={(e) => {
                          addFiles(e.target.files);
                          e.target.value = '';
                        }}
                        className="sr-only"
                      />
                    </label>
                  </li>
                </ul>
              )}
              {single && (
                <p className="mt-1.5 text-[10px] text-slate-400 truncate">
                  {files[0].name} · {formatBytes(files[0].size)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="media-upload-type" className={LABEL_CLASS}>
                Type
              </label>
              <select
                id="media-upload-type"
                value={type}
                onChange={(e) => setType(e.target.value as MediaType)}
                className={FIELD_CLASS}
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className={LABEL_CLASS}>Visibility</legend>
              <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 dark:border-slate-800 p-0.5">
                {[
                  { value: true, label: 'Public', Icon: Globe },
                  { value: false, label: 'Private', Icon: Lock },
                ].map(({ value, label, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={isPublic === value}
                    onClick={() => setIsPublic(value)}
                    className={`flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                      isPublic === value
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <p className="text-[11px] text-slate-500 -mt-1">
            {isLogo
              ? isPublic
                ? 'Shown in the “Our Customers” section on the home page. Transparent PNG or SVG works best.'
                : 'Private logos are not shown on the home page — choose Public to show it.'
              : isPublic
                ? 'Public files can be used on this site and fetched by other sites through the Media API.'
                : 'Private files are only visible here in the admin.'}
          </p>

          {files.length > 1 ? (
            <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
              Uploading {files.length} files — add {isLogo ? 'company names, links and order' : 'alt text'} on each card
              afterwards.
            </p>
          ) : (
            <>
              <div>
                <label htmlFor="media-upload-alt" className={LABEL_CLASS}>
                  {isLogo ? 'Company name' : 'Alt text'}
                </label>
                <input
                  id="media-upload-alt"
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder={isLogo ? 'e.g. Acme Agro Foods Ltd' : 'Describe the image for screen readers'}
                  className={FIELD_CLASS}
                />
              </div>

              {isLogo && (
                <div className="grid grid-cols-[1fr_6rem] gap-4">
                  <div>
                    <label htmlFor="media-upload-link" className={LABEL_CLASS}>
                      Website link <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="media-upload-link"
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://"
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="media-upload-order" className={LABEL_CLASS}>
                      Order
                    </label>
                    <input
                      id="media-upload-order"
                      type="number"
                      step={1}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      placeholder="Last"
                      title="Lower shows first; blank goes last"
                      className={FIELD_CLASS}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {errors.length > 0 && (
            <ul className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 space-y-1">
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? 'Uploading…' : files.length > 1 ? `Upload ${files.length} files` : 'Upload'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
