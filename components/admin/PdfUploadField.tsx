'use client';

import React from 'react';
import { ExternalLink, FileText, Loader2, Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DOCUMENTS_BUCKET, documentFileUrl } from '@/lib/navTree';
import { discardUnsavedUpload } from '@/app/admin/(protected)/navigation/actions';

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

export interface PdfValue {
  file_path: string | null;
  file_name: string | null;
}

// Uploads straight from the browser to the website-documents bucket, like
// MediaLibrary does for images: annual reports routinely exceed the 4.5 MB
// request body limit of a Vercel function, so they can't go through a
// Server Action. The file is stored under a random folder with its original
// (sanitized) name, so the tab a visitor opens shows a readable file name.
//
// `savedPath` is the PDF the item currently has in the database. Uploading a
// replacement (or clearing) before saving removes the previous *unsaved*
// upload right away; the saved one is only removed by the server once the
// item is actually saved without it.
export function PdfUploadField({
  value,
  savedPath,
  onChange,
  emptyHint,
}: {
  value: PdfValue;
  savedPath: string | null;
  onChange: (value: PdfValue) => void;
  emptyHint?: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function discardIfUnsaved(path: string | null) {
    if (path && path !== savedPath) void discardUnsavedUpload(path);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF files can be uploaded.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('The PDF is larger than 50 MB.');
      return;
    }

    setUploading(true);
    const safeName =
      file.name
        .replace(/\.pdf$/i, '')
        .normalize('NFKD')
        .replace(/[^A-Za-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'document';
    const path = `${crypto.randomUUID()}/${safeName}.pdf`;
    const { error: uploadError } = await createClient()
      .storage.from(DOCUMENTS_BUCKET)
      .upload(path, file, { cacheControl: '31536000', contentType: 'application/pdf', upsert: false });
    setUploading(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    discardIfUnsaved(value.file_path);
    onChange({ file_path: path, file_name: file.name });
  }

  return (
    <div className="space-y-2">
      {value.file_path ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5">
          <FileText className="w-4 h-4 shrink-0 text-red-500" />
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{value.file_name ?? value.file_path}</span>
          {value.file_path !== savedPath && (
            <span className="shrink-0 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Unsaved</span>
          )}
          <a
            href={documentFileUrl(value.file_path)}
            target="_blank"
            rel="noopener"
            className="shrink-0 text-slate-400 hover:text-primary-600"
            title="Open PDF"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={() => {
              discardIfUnsaved(value.file_path);
              onChange({ file_path: null, file_name: null });
            }}
            className="shrink-0 text-slate-400 hover:text-red-500"
            title="Remove PDF"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        emptyHint && <p className="text-[12px] text-slate-500">{emptyHint}</p>
      )}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:border-primary-500 disabled:opacity-60"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? 'Uploading…' : value.file_path ? 'Replace PDF' : 'Upload PDF'}
      </button>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      {error && <p className="text-[12px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}
