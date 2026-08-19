'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Matches artificial-wit-web-apps' DynamicForm.tsx section pattern: a
// bordered rounded card with a clickable chevron+title header that toggles
// the body's visibility, re-themed to this site's amber/slate palette
// instead of their CSS variables.
export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
          open ? 'border-b border-slate-200 dark:border-slate-800' : ''
        }`}
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
        <span className="text-[13px] font-bold text-slate-900 dark:text-white">{title}</span>
      </button>

      {open && <div className="p-4">{children}</div>}
    </div>
  );
}
