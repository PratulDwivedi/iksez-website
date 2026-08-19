'use client';

import React from 'react';
import { Code2 } from 'lucide-react';
import { ApiIntegrationDialog, type ApiIntegrationDialogProps } from './ApiIntegrationDialog';

type ApiIntegrationButtonProps = Omit<ApiIntegrationDialogProps, 'isOpen' | 'onClose'>;

// Icon-only trigger for ApiIntegrationDialog — owns the open/close state so
// call sites (Server Component admin pages) just drop this in next to their
// page action button and pass the endpoint content, without wiring up
// their own state.
export function ApiIntegrationButton(props: ApiIntegrationButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary-500 hover:border-primary-500/40 hover:bg-primary-500/5 transition-colors"
        title="API integration instructions"
        aria-label="API integration instructions"
      >
        <Code2 className="w-4 h-4" />
      </button>
      <ApiIntegrationDialog {...props} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
