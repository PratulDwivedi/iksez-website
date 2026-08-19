'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useAdminShell } from '@/context/admin-shell-context';

// Common header for every /admin page: mobile menu button + icon + title +
// subtitle + an optional page-specific action (e.g. "New Post"). Matches the
// icon/title/subtitle block pattern from artificial-wit-web-apps'
// ProfilePage.tsx, but as one shared component instead of each page
// re-implementing its own header. Sticky at the top of the scrollable
// content column (not the sidebar) — see (protected)/layout.tsx, which
// removed its own padding/max-w wrapper so this can span full width and
// stay pinned while the page content below it scrolls.
//
// Theme toggle intentionally lives in AdminSidebar's profile dropdown, not
// here — moved there to match the reference codebase's UserMenu pattern.
//
// `icon` takes an already-rendered element (e.g. `<FileText .../>`), not a
// component reference — this is a Client Component (needs useAdminShell for
// the mobile menu button), and every caller is a Server Component page.
// Passing a component *type* across that boundary fails RSC serialization
// ("Only plain objects can be passed to Client Components...") since a
// Lucide icon component is a forwardRef object, not plain data; a rendered
// element is a serializable plain object and crosses fine.
interface AdminPageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({ icon, title, subtitle, action }: AdminPageHeaderProps) {
  const { setMobileOpen } = useAdminShell();

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-3 sm:px-6 py-3 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary-500/10 text-primary-500">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">{action}</div>
    </div>
  );
}
