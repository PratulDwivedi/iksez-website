'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { RefreshCw } from 'lucide-react';

// router.refresh() re-runs the current route's Server Component (re-fetching
// via callRpc/supabase.rpc) without a full page reload or losing client
// state elsewhere on the page — the standard App Router pattern for "get
// latest data" on a server-rendered page. useTransition gives us a pending
// flag to spin the icon without needing router.refresh()'s own promise.
export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      title="Refresh stats"
      aria-label="Refresh stats"
      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary-500 hover:border-primary-500/40 hover:bg-primary-500/5 disabled:opacity-60 transition-colors"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
    </button>
  );
}
