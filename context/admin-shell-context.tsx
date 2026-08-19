'use client';

import React from 'react';

// Shared UI state between AdminSidebar (mobile drawer) and AdminPageHeader
// (mobile hamburger button that opens it) — they're siblings under
// (protected)/layout.tsx, not parent/child, so a small context is simpler
// than prop-drilling through every page.
//
// No desktop collapse mode — matches the reference codebase exactly
// (DynamicSidebar.tsx is always full-width on desktop; only the mobile
// drawer opens/closes). An earlier version of this context also had a
// `collapsed`/`toggleCollapsed` desktop icon-only mode; removed per explicit
// request, so don't reintroduce it without being asked again.
interface AdminShellContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const AdminShellContext = React.createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <AdminShellContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  const ctx = React.useContext(AdminShellContext);
  if (!ctx) {
    throw new Error('useAdminShell must be used within AdminShellProvider');
  }
  return ctx;
}
