'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  FolderKanban,
  ScrollText,
  FileText,
  Newspaper,
  Quote,
  Users,
  LifeBuoy,
  Image as ImageIcon,
  Sprout,
  LayoutDashboard,
  UserRound,
  Wheat,
  CalendarRange,
  CalendarDays,
  HelpCircle,
  FileSpreadsheet,
  ShoppingCart,
  ShieldCheck,
  UserCog,
  KeyRound,
  Lock,
  User,
  Settings,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  ExternalLink,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAdminShell } from '@/context/admin-shell-context';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { adminMenu, isMenuGroup, type AdminMenuGroup } from '@/lib/adminMenu';

// Structure (tenant block top / nav middle / user-menu dropdown bottom /
// mobile off-canvas drawer) follows artificial-wit-web-apps' DynamicSidebar.tsx
// and UserMenu component closely — same interaction pattern (outside-click-
// closes dropdown, translate-x mobile drawer with backdrop), re-themed to
// this site's Tailwind palette instead of their CSS variables.
// Always full-width on desktop (no icon-only collapse mode) — matches the
// reference exactly; only the mobile drawer opens/closes.
// The theme toggle lives in the user-menu dropdown below ("Light Mode" /
// "Dark Mode" row with an animated pill switch), matching the reference's
// UserMenu pattern, instead of a standalone header button.
//
// Nav content comes from lib/adminMenu.json (route/name/icon/children) —
// icon there is a lucide-react component *name* string, resolved to an
// actual component via this map. Add new icons here when adminMenu.json
// references one that isn't imported above yet.
const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  FolderKanban,
  ScrollText,
  FileText,
  Newspaper,
  Quote,
  Users,
  LifeBuoy,
  Image: ImageIcon,
  Sprout,
  LayoutDashboard,
  UserRound,
  Wheat,
  CalendarRange,
  CalendarDays,
  HelpCircle,
  FileSpreadsheet,
  ShoppingCart,
  ShieldCheck,
  UserCog,
  KeyRound,
  Lock,
  User,
  Settings,
};

function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? FolderKanban;
}

interface SidebarTenant {
  name: string;
  code: string;
  logoUrl?: string | null;
}

interface SidebarProfile {
  email: string;
  fullName: string | null;
  userName: string | null;
  profilePic?: string | null;
  roleHint?: string | null;
}

function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function isRouteActive(pathname: string | null, route: string): boolean {
  return pathname === route || (pathname?.startsWith(`${route}/`) ?? false);
}

function groupHasActiveChild(pathname: string | null, group: AdminMenuGroup): boolean {
  return group.children.some((child) => isRouteActive(pathname, child.route));
}

// One collapsible section: header row toggles children open/closed (chevron
// rotates), same interaction as the reference screenshot's "Features" list.
// Auto-expanded on mount when it contains the active route (see
// AdminSidebar's initial state below) so the current page is never hidden
// inside a collapsed group; otherwise starts collapsed.
//
// `icon` takes an already-rendered element, not a component reference —
// same reasoning as AdminPageHeader's `icon` prop: resolving iconFor()
// straight to a capitalized local (`const GroupIcon = iconFor(...)`) and
// rendering `<GroupIcon />` inside this component's own body trips
// react-hooks/static-components ("component created during render"), since
// the linter can't prove iconFor() returns a stable reference. Resolving it
// in the caller's .map() callback instead sidesteps that.
function NavGroup({
  group,
  icon,
  pathname,
  expanded,
  onToggle,
  onNavigate,
}: {
  group: AdminMenuGroup;
  icon: React.ReactNode;
  pathname: string | null;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const hasActiveChild = groupHasActiveChild(pathname, group);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm font-normal transition-colors ${
          hasActiveChild && !expanded
            ? 'text-primary-500'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        {icon}
        <span className="flex-1 text-left">{group.name}</span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-0.5 ml-3 pl-2.5 border-l border-slate-200 dark:border-slate-800">
          {group.children.map((child) => {
            const Icon = iconFor(child.icon);
            const active = isRouteActive(pathname, child.route);
            return (
              <Link
                key={child.route}
                href={child.route}
                onClick={onNavigate}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-normal transition-colors ${
                  active
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {child.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ tenant, profile }: { tenant: SidebarTenant; profile: SidebarProfile }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileOpen, setMobileOpen } = useAdminShell();
  const { darkMode, toggleDarkMode } = useThemeToggle();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [opening, setOpening] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // All groups start expanded so the full nav is visible up front. Keyed by
  // group name since that's the only stable identifier groups have in
  // adminMenu.json.
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of adminMenu) {
      if (isMenuGroup(item)) {
        initial.add(item.name);
      }
    }
    return initial;
  });

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login/');
    router.refresh();
  };

  const displayName = profile.fullName || profile.userName || 'User';
  const initials = initialsFor(displayName);

  return (
    <>
      {/* Mobile backdrop — clicking it closes the drawer, same as the reference */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`flex flex-col h-screen w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Tenant block — top left, per fn_get_profile's `tenant` object */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-primary-500/10 text-primary-600 dark:text-primary-500 font-bold text-sm">
            {tenant.logoUrl?.startsWith('http') ? (
              // Per-tenant logo, when one is set (tenant.data.logo_url).
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-cover" />
            ) : (
              // Falls back to this site's own app logo (same asset as
              // Header.tsx and the admin login page) instead of a bare
              // initial letter — object-contain since it's a wide
              // logotype, not a square mark, so it shouldn't be cropped
              // like a per-tenant avatar would be.
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/logo.png" alt={tenant.name} className="w-full h-full object-contain p-1" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{tenant.name}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-wide">{tenant.code}</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav — flat items link directly (e.g. Dashboard); groups (Content
            Management, Agri Business, User Management) are collapsible, see
            NavGroup above. */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {adminMenu.map((item) => {
            if (isMenuGroup(item)) {
              const GroupIcon = iconFor(item.icon);
              return (
                <NavGroup
                  key={item.name}
                  group={item}
                  icon={<GroupIcon className="w-4 h-4 shrink-0" />}
                  pathname={pathname}
                  expanded={expandedGroups.has(item.name)}
                  onToggle={() => toggleGroup(item.name)}
                  onNavigate={() => setMobileOpen(false)}
                />
              );
            }

            const Icon = iconFor(item.icon);
            const active = isRouteActive(pathname, item.route);
            return (
              <Link
                key={item.route}
                href={item.route}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-normal transition-colors ${
                  active
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User menu — bottom left, per fn_get_profile's profile fields.
            Dropdown opens upward (absolute bottom-full), closes on outside
            click — same interaction as the reference's UserMenu. */}
        <div className="relative px-2 py-2" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden z-50">
              {/* View Website — opens in a new tab so it doesn't navigate the
                  admin session away from whatever the admin was doing.
                  NavigationProgressBar deliberately skips target="_blank"
                  links, so without this the click gave zero feedback while
                  the new tab spun up — briefly swapping the icon for a
                  spinner acknowledges the click instead of it feeling
                  stuck. */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setOpening(true);
                  window.setTimeout(() => setOpening(false), 1200);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-normal text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {opening ? (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="flex-1">View Website</span>
                <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
              </a>
              <Link
                href="/admin/profile"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-normal text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-200 dark:border-slate-800"
              >
                <User className="w-3.5 h-3.5 text-slate-400" /> View Profile
              </Link>
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-normal text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-200 dark:border-slate-800"
              >
                {darkMode ? (
                  <Sun className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="flex-1">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                <span
                  className={`relative inline-flex items-center w-8 h-4 rounded-full transition-colors shrink-0 ${
                    darkMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute w-3 h-3 rounded-full bg-white shadow transition-transform ${
                      darkMode ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-normal text-red-500 hover:bg-red-500/10 border-t border-slate-200 dark:border-slate-800"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            title={profile.email}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-primary-500 text-white text-[11px] font-bold">
              {profile.profilePic?.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profilePic} alt={initials} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{profile.roleHint || profile.email}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}
