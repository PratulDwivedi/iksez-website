'use client';

import React from 'react';
import Image from 'next/image';
import { Upload, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { resolveCoverUrl } from '@/lib/blogCover';

const BUCKET = 'blog-covers';
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:outline-none focus:border-primary-500 transition';

// Lets an author either type a path manually (existing local /blog/*.svg
// covers keep working) or upload straight to the `blog-covers` Supabase
// Storage bucket, which fills the same cover_url field with just the
// uploaded file's bare name (e.g. "abc123.png") rather than a full URL —
// the actual URL is reconstructed at read time via resolveCoverUrl, so the
// stored value stays storage-provider-agnostic (see src/lib/blogCover.ts).
// Kept as one text input (not a separate hidden field) so manual edits and
// uploads both flow through the same form field the server action already
// expects.
export function CoverImageField({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [url, setUrl] = React.useState(defaultValue ?? '');
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only PNG, JPEG, WebP, or AVIF images are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File is larger than 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      });
      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      // Store the bare filename, not the full public URL — see
      // src/lib/blogCover.ts for why.
      setUrl(path);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          id={name}
          name={name}
          required
          placeholder="abc123.png (uploaded) or /blog/my-post.svg (local)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputCls}
        />
        <label
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            uploading ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

      {url && (
        <div className="relative w-32 aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group">
          <Image
            src={resolveCoverUrl(url)}
            alt="Cover preview"
            fill
            crossOrigin="anonymous"
            className="object-cover"
            unoptimized={url.startsWith('data:')}
          />
          <button
            type="button"
            onClick={() => setUrl('')}
            title="Clear"
            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
