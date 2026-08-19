'use client';

import React from 'react';
import { Check, Copy, KeyRound, Loader2 } from 'lucide-react';

interface ApiKeyCardProps {
  title: string;
  description: string;
  resetLabel: string;
  confirmMessage: string;
  onReset: () => Promise<{ key: string | null; error: string | null }>;
}

// Reveal-once pattern: the plaintext key is only ever available in the
// response right after a reset (matching fn_reset_api_key / fn_reset_
// publishable_api_key — there's no fn_get_api_key equivalent in this
// project, unlike artificial-wit-web-apps, so there's nothing to mask/
// reveal later — once you navigate away, it's gone until the next reset).
export function ApiKeyCard({ title, description, resetLabel, confirmMessage, onReset }: ApiKeyCardProps) {
  const [confirming, setConfirming] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [key, setKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleReset = async () => {
    setResetting(true);
    setError(null);
    setConfirming(false);
    const result = await onReset();
    if (result.error) {
      setError(result.error);
    } else {
      setKey(result.key);
    }
    setResetting(false);
  };

  const handleCopy = async () => {
    if (!key) return;
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
          <KeyRound className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <p className="text-xs text-slate-500">{description}</p>

      {key && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-primary-600 dark:text-primary-500">
            Copy this now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs break-all">
              {key}
            </code>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              title="Copy"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {confirming ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="flex-1 text-xs text-red-600 dark:text-red-400">{confirmMessage}</p>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold shrink-0"
          >
            Confirm
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          disabled={resetting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
        >
          {resetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {resetLabel}
        </button>
      )}
    </div>
  );
}
