'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Check, Copy, KeyRound, X } from 'lucide-react';

export interface ApiIntegrationParam {
  name: string;
  in: 'query' | 'header' | 'body' | 'path';
  description: string;
  required?: boolean;
}

export interface ApiIntegrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  method: 'GET' | 'POST';
  endpoint: string;
  params?: ApiIntegrationParam[];
  requestExample: string;
  responseExample: string;
  // Overrides the generic "required, no fallback" default text below with
  // an endpoint-specific note (e.g. write endpoints mentioning what access
  // a valid key grants). Every current endpoint requires a key — none
  // default to any tenant's data when omitted (fixed July 2026, see
  // README.md's Integrations section) — so the fallback text is
  // deliberately generic rather than assuming read-vs-write.
  keyNote?: string;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code">
      <pre className="p-4 rounded-xl bg-slate-950 dark:bg-black border border-slate-800 text-[11px] leading-relaxed text-slate-200 overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors opacity-0 group-hover/code:opacity-100 focus:opacity-100"
        title="Copy"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
      </button>
    </div>
  );
}

// Generic "how to integrate this endpoint" popup — content is entirely
// prop-driven so the same component covers every public API this app
// exposes (blogs today, leads/contact-form later), not just blogs.
export function ApiIntegrationDialog({
  isOpen,
  onClose,
  title,
  description,
  method,
  endpoint,
  params = [],
  requestExample,
  responseExample,
  keyNote,
}: ApiIntegrationDialogProps) {
  if (!isOpen) return null;

  // Portaled to document.body — AdminPageHeader (this dialog's trigger lives
  // in its `action` slot) uses `backdrop-blur`, and backdrop-filter (like
  // transform/filter) creates a new containing block for position:fixed
  // descendants. Without the portal, `fixed inset-0` here resolves against
  // that header bar's own small box instead of the viewport, so the overlay
  // renders squashed into the header instead of covering the screen.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight truncate">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-primary-600 text-white text-[10px] font-extrabold uppercase tracking-wide shrink-0">
              {method}
            </span>
            <code className="text-xs font-semibold text-slate-700 dark:text-slate-200 break-all">{endpoint}</code>
          </div>

          <div className="p-3.5 rounded-xl bg-primary-500/5 border border-primary-500/20 text-slate-700 dark:text-slate-300 space-y-1.5">
            <p>
              Pass your tenant&apos;s <strong>Publishable API Key</strong> in the{' '}
              <code className="px-1 py-0.5 rounded bg-slate-950/10 dark:bg-white/10">x-api-key</code> header.{' '}
              {keyNote ?? 'Required — a missing or invalid key is rejected instead of falling back to any tenant.'}
            </p>
            <p>
              Get your key from{' '}
              <Link href="/admin/settings" className="font-bold text-primary-600 dark:text-primary-500 hover:underline">
                Settings → Publishable API Key
              </Link>
              . It&apos;s safe to embed in client-side code — it only grants scoped access to your own tenant&apos;s
              data.
            </p>
          </div>

          {params.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Parameters</h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                {params.map((p) => (
                  <div key={p.name} className="flex items-start gap-3 p-3">
                    <code className="shrink-0 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-primary-600 dark:text-primary-500">
                      {p.name}
                    </code>
                    <span className="shrink-0 text-[10px] uppercase tracking-wide font-bold text-slate-400 pt-0.5">
                      {p.in}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Request</h4>
            <CodeBlock code={requestExample} />
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Response</h4>
            <CodeBlock code={responseExample} />
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
