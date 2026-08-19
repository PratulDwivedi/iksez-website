import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { NavigationProgressBar } from '@/components/admin/NavigationProgressBar';
import { AdminShellProvider } from '@/context/admin-shell-context';

interface FnGetProfileRow {
  id: number;
  user_id: string;
  tenant_id: number;
  email: string;
  user_name: string | null;
  full_name: string | null;
  data: {
    is_admin?: boolean;
    profile_pic?: string | null;
    role_hint?: string | null;
  } & Record<string, unknown>;
  tenant: {
    id: number;
    code: string;
    name: string;
    data: ({ logo_url?: string | null } & Record<string, unknown>) | null;
  };
}

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // fn_get_profile() doubles as the liveness + active-account check: inside,
  // fn_get_request_context() requires a valid session, and the query itself
  // filters on p.is_active = true — a stale session or a deactivated profile
  // both come back as is_success: false. It also happens to be exactly the
  // data the sidebar needs (tenant + user info), so one call covers both.
  //
  // fn_is_admin() (access_control @> {"role":"admin"}) remains the actual
  // authorization gate, kept separate from profile.data.is_admin (which
  // reads access_control->>'is_admin' — a different key).
  //
  // auth.getUser() is belt-and-braces alongside src/proxy.ts, which already
  // redirects unauthenticated requests to /admin/login before they reach
  // this layout. None of these three calls depends on any of the others'
  // results (each only needs the session cookie already on the request), so
  // they all run concurrently — getUser() used to run as its own sequential
  // round trip before the other two even started, which is real, avoidable
  // latency in front of every route in this tree.
  const [
    {
      data: { user },
    },
    { data: profileRows, error: profileError },
    { data: isAdmin },
  ] = await Promise.all([
    supabase.auth.getUser(),
    callRpc<FnGetProfileRow[]>(supabase, 'fn_get_profile'),
    supabase.rpc('fn_is_admin'),
  ]);

  if (!user) {
    redirect('/admin/login/');
  }

  const profile = profileRows?.[0];

  if (profileError || !profile || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
        <div className="max-w-sm space-y-4">
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Not authorized</h1>
          <p className="text-sm text-slate-500">
            {profileError ??
              `Your account (${user.email}) is signed in but doesn't have admin access to this panel.`}
          </p>
          <Link
            href="/admin/login"
            className="inline-block px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminShellProvider>
      <NavigationProgressBar />
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <AdminSidebar
          tenant={{
            name: profile.tenant?.name ?? '',
            code: profile.tenant?.code ?? '',
            logoUrl: profile.tenant?.data?.logo_url ?? null,
          }}
          profile={{
            email: profile.email,
            fullName: profile.full_name,
            userName: profile.user_name,
            profilePic: profile.data?.profile_pic ?? null,
            roleHint: (profile.data?.role_hint as string | undefined) ?? null,
          }}
        />
        {/* No padding/max-w here — each page renders its own AdminPageHeader
            (full-bleed, sticky) followed by a padded content wrapper, so the
            header can span the full width of this column while staying
            pinned as the page content scrolls. */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </AdminShellProvider>
  );
}
