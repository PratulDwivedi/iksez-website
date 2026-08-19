import { Construction } from 'lucide-react';

// Shared body for every /admin section that's in the nav (see
// lib/adminMenu.json) but not built yet — keeps each of those page.tsx
// files to a header + this, instead of each hand-rolling its own empty state.
export function ComingSoonPlaceholder({ title }: { title: string }) {
  return (
    <div className="px-6 sm:px-10 py-16 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary-500/10 text-primary-500">
        <Construction className="w-5 h-5" />
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{title} is coming soon</p>
      <p className="text-xs text-slate-500 max-w-sm">
        This section isn&apos;t built yet — check back after it ships.
      </p>
    </div>
  );
}
