'use client';

import React from 'react';
import { useActionState } from 'react';
import { Newspaper, Loader2, Code, Eye, Upload, X, ImageOff, GripVertical } from 'lucide-react';
import { saveNewsEvent } from '@/app/admin/(protected)/news-events/actions';
import { blocksToText, textToBlocks, type BlogBlock } from '@/lib/blogBody';
import { galleryToText, textToGallery, type GalleryImage } from '@/lib/newsEventGallery';
import { createClient } from '@/lib/supabase/client';
import { AdminPageHeader } from './AdminPageHeader';
import { CollapsibleSection } from './CollapsibleSection';
import { BlogBody } from '../BlogBody';

export interface NewsEventFormPost {
  id: number;
  title: string;
  event_date: string | null;
  gallery: GalleryImage[];
  body: BlogBlock[];
  published: boolean;
}

// Same input/label typography as BlogForm.tsx — this admin console's shared
// convention, not re-derived here.
const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:outline-none focus:border-primary-500 transition';
const labelCls =
  'text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block';
const Required = () => <span className="text-red-500 normal-case">&nbsp;*</span>;

const FORM_ID = 'news-event-form';

export function NewsEventForm({ post }: { post?: NewsEventFormPost }) {
  const [state, formAction, pending] = useActionState(saveNewsEvent, { error: null });

  return (
    <>
      <AdminPageHeader
        icon={<Newspaper className="w-4 h-4" />}
        title={post ? 'Edit Item' : 'New Item'}
        subtitle={post ? post.title : 'Add a News & Events item.'}
        action={
          <button
            type="submit"
            form={FORM_ID}
            disabled={pending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-colors"
          >
            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {pending ? 'Saving…' : post ? 'Save Changes' : 'Create Item'}
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
                  <label className={labelCls} htmlFor="title">Title<Required /></label>
                  <input id="title" name="title" required defaultValue={post?.title} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="event_date">
                    Event date <span className="ml-1 font-normal normal-case text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="event_date"
                    name="event_date"
                    type="date"
                    defaultValue={post?.event_date ?? ''}
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

          <CollapsibleSection title="Content">
            <BodyEditor defaultValue={blocksToText(post?.body)} />
          </CollapsibleSection>

          <CollapsibleSection title="Gallery">
            <GalleryEditor defaultImages={post?.gallery ?? []} />
          </CollapsibleSection>
        </form>
      </div>
    </>
  );
}

const GALLERY_BUCKET = 'website-media';
const GALLERY_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
const GALLERY_MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Uploads directly to the same 'website-media' Supabase Storage bucket the
// Media Library admin page (components/admin/MediaLibrary.tsx) already
// uses — public files, same upload mechanics (client-side upload +
// getPublicUrl, no server action round trip per file). Each uploaded
// image becomes a { url, caption } pair, edited here and serialized into
// the same "url | caption" per-line text the server action already parses
// (lib/newsEventGallery.ts) via a hidden input — so actions.ts needed no
// changes for this to plug in.
function GalleryEditor({ defaultImages }: { defaultImages: GalleryImage[] }) {
  const [images, setImages] = React.useState<GalleryImage[]>(defaultImages);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();

    for (const file of files) {
      if (!GALLERY_ACCEPTED_TYPES.includes(file.type)) {
        setError(`${file.name}: unsupported file type (PNG, JPEG, WebP, or AVIF only)`);
        continue;
      }
      if (file.size > GALLERY_MAX_SIZE_BYTES) {
        setError(`${file.name}: larger than 10MB`);
        continue;
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      });
      if (uploadError) {
        setError(`${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
      setImages((prev) => [...prev, { url: urlData.publicUrl, caption: '' }]);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function updateCaption(index: number, caption: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, caption } : img)));
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  // Native HTML5 drag-and-drop reorder — no dnd library in this project's
  // dependencies, and a handful of gallery images per item doesn't warrant
  // adding one. Array order is the actual save order (galleryToText below
  // serializes in array order), so reordering here is the entire mechanism,
  // not just a display concern.
  const dragIndex = React.useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setDragOverIndex(null);
    if (from === null || from === index) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className={labelCls}>
          Gallery images<Required /> — upload photos, drag to reorder, give each a caption.
        </label>
        <label
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-[11px] shadow-md transition-colors cursor-pointer shrink-0 ${
            uploading ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload images
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={GALLERY_ACCEPTED_TYPES.join(',')}
            onChange={handleFilesSelected}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Serialized to the same plain-text format the server action already
          parses (lib/newsEventGallery.ts) — the form submits this hidden
          field, not per-image inputs. */}
      <input type="hidden" name="gallery" value={galleryToText(images)} />

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-red-400 border border-dashed border-red-300 dark:border-red-900 rounded-xl">
          <ImageOff className="w-6 h-6" />
          <p className="text-xs font-semibold">At least one image is required — upload some above.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {images.map((image, index) => (
            <div
              key={image.url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => setDragOverIndex(null)}
              className={`flex gap-3 p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 cursor-grab active:cursor-grabbing transition-colors ${
                dragOverIndex === index
                  ? 'border-primary-500 border-dashed'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.caption || 'Gallery image'}
                draggable={false}
                className="w-20 h-20 rounded-lg object-cover shrink-0 bg-slate-200 dark:bg-slate-800"
              />
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 justify-center">
                <input
                  type="text"
                  placeholder="Caption"
                  value={image.caption}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="self-start inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type BodyMode = 'write' | 'preview';

// Write/Preview toggle for the body textarea — same pattern as BlogForm.tsx's
// BodyEditor (kept as a separate copy rather than a shared export since the
// two forms live in different route trees and this one has no FAQ/table
// callout text to keep in sync).
function BodyEditor({ defaultValue }: { defaultValue: string }) {
  const [mode, setMode] = React.useState<BodyMode>('write');
  const [text, setText] = React.useState(defaultValue);
  const blocks = React.useMemo(() => textToBlocks(text), [text]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className={labelCls} htmlFor="body">
          Body<Required /> — blank line between paragraphs, prefix a line with{' '}
          <code className="text-primary-600 dark:text-primary-500 normal-case">### </code> for a subheading.
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
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`${inputCls} font-mono text-xs leading-relaxed`}
        />
      ) : (
        <>
          <input type="hidden" name="body" value={text} />
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-5 min-h-[240px] prose dark:prose-invert max-w-none space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
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
