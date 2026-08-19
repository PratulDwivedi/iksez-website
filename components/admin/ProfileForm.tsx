'use client';

import React from 'react';
import { useActionState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { saveProfile, changePassword } from '@/app/admin/(protected)/profile/actions';
import { AdminPageHeader } from './AdminPageHeader';
import { CollapsibleSection } from './CollapsibleSection';

// Matches artificial-wit-web-apps' ProfilePage.tsx input/label typography
// exactly (rounded-xl px-3 py-2.5 text-[13px] / text-[11px] uppercase
// tracking-wide labels), re-themed to this site's amber/slate palette.
const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:outline-none focus:border-primary-500 transition';
const labelCls =
  'text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block';

export interface ProfileFormData {
  user_name: string | null;
  full_name: string | null;
  email: string;
  tenant_name: string;
  is_admin: boolean;
}

const PROFILE_FORM_ID = 'profile-form';

export function ProfileForm({ profile }: { profile: ProfileFormData }) {
  const [profileState, profileAction, profilePending] = useActionState(saveProfile, {
    error: null,
    success: false,
  });

  return (
    <>
      <AdminPageHeader
        icon={<User className="w-4 h-4" />}
        title="Profile"
        subtitle="Manage your account details and password."
        action={
          // form="profile-form" submits the profile <form> below even though
          // this button lives in the header — same pattern as BlogForm's
          // header-hosted Create/Update Post button. Change Password stays a
          // separate form/action with its own inline submit button, since
          // it's a distinct action from saving profile details.
          <button
            type="submit"
            form={PROFILE_FORM_ID}
            disabled={profilePending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-colors"
          >
            {profilePending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {profilePending ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="px-4 sm:px-10 py-8">
        <div className="space-y-4 max-w-2xl">
          <CollapsibleSection title="Profile">
            <form id={PROFILE_FORM_ID} action={profileAction} className="space-y-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-500 font-bold">
                  {profile.tenant_name}
                </span>
                {profile.is_admin && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    Admin
                  </span>
                )}
              </div>

              <div>
                <label className={labelCls} htmlFor="email">
                  Email
                  <span className="ml-1 font-normal normal-case text-slate-400">
                    (display only — does not change your login email)
                  </span>
                </label>
                <input id="email" name="email" type="email" defaultValue={profile.email} className={inputCls} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="full_name">Full name</label>
                  <input
                    id="full_name"
                    name="full_name"
                    defaultValue={profile.full_name ?? ''}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="user_name">Display name</label>
                  <input
                    id="user_name"
                    name="user_name"
                    defaultValue={profile.user_name ?? ''}
                    className={inputCls}
                  />
                </div>
              </div>

              {profileState.error && (
                <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {profileState.error}
                </p>
              )}
              {profileState.success && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                  Saved.
                </p>
              )}
            </form>
          </CollapsibleSection>

          <CollapsibleSection title="Change Password" defaultOpen={false}>
            <PasswordForm />
          </CollapsibleSection>
        </div>
      </div>
    </>
  );
}

function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="space-y-4" key={state.success ? 'reset' : 'form'}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="password">New password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="confirm_password">Confirm new password</label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputCls}
          />
        </div>
      </div>

      {state.error && (
        <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          Password updated.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg transition-all"
      >
        {pending ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  );
}
