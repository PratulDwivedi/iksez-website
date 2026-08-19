'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Eye, EyeOff, LayoutDashboard, FolderKanban, Sprout, ShieldCheck, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggleButton } from '@/components/admin/ThemeToggleButton';

function IksezLogo({ size = 40 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/images/logo.png" alt="IFFCO Kisan SEZ logo" width={size} height={size * 0.38} />;
}

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Dashboards',
    description: 'CMS Dashboard and Agri Dashboard — a real-time overview of content and agribusiness operations.',
  },
  {
    icon: FolderKanban,
    title: 'Content Management',
    description: 'Blogs, testimonials, leads, tickets, and media — everything on the public site, changes go live immediately.',
  },
  {
    icon: Sprout,
    title: 'Agri Business',
    description: 'Farmers, crops, crop seasons, crop calendar, queries, factsheets, and crop sell slots.',
  },
  {
    icon: ShieldCheck,
    title: 'User Management',
    description: 'Users, roles, access control, settings, and profile — row-level security enforces who can read and write every record.',
  },
];

// Same wordmark + tagline lockup as Navbar.tsx (site-wide brand identity),
// reused here since /admin skips the marketing Navbar entirely (see
// SiteChrome.tsx) — without this, the login page had no site branding at
// all beyond the bare icon. Fully theme-responsive, used identically on
// both the desktop branding panel and the mobile header.
function Wordmark() {
  return (
    <div className="flex flex-col">
      <span className="font-extrabold text-xl leading-none tracking-tight flex items-center gap-1 text-slate-900 dark:text-white">
        IFFCO Kisan{' '}
        <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
          SEZ
        </span>
      </span>
      <span className="text-[10px] font-semibold tracking-wider uppercase mt-1 text-slate-500 dark:text-slate-400">
        Admin Console
      </span>
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    router.push('/admin/');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 relative">
      <ThemeToggleButton className="absolute top-5 right-5 z-10" />

      {/* Branding panel — hidden on mobile, matches the reference's split
          composition. Unlike a customer-facing product, there's no feature
          list to "sell" here (this is an internal tool, no self-signup) —
          the copy just orients whoever's logging in. Fully theme-responsive
          (bg/text all carry dark: variants) — both panels follow the same
          toggle, matching the rest of the site rather than being pinned to
          one look. */}
      <div className="hidden md:flex flex-col justify-center px-16 py-16 flex-1 max-w-[640px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-10">
          <IksezLogo size={40} />
          <Wordmark />
        </div>
        <h1 className="text-2xl font-extrabold mb-3 text-slate-900 dark:text-white">Admin Panel</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-12 max-w-sm leading-relaxed">
          Manage IFFCO Kisan SEZ&apos;s blogs, testimonials, leads, tickets, and media. Access is restricted to admins only.
        </p>
        <div className="space-y-7">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary-500/10">
                <Icon className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex flex-col items-center gap-3 mb-8">
            <IksezLogo size={40} />
            <Wordmark />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5"
          >
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Admin Sign In</h2>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-primary-500"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:border-primary-500"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  or
                </span>
              </div>
            </div>

            {/* Not wired up yet — UI placeholder only, per explicit request
                to add this now and implement the actual SSO flow later. */}
            <button
              type="button"
              disabled
              title="Coming soon"
              className="w-full py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Building2 className="w-4 h-4" />
              Sign in with SSO
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-slate-100 dark:bg-slate-800">
                Soon
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
