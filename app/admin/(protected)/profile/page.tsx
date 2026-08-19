import { User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { ProfileForm } from '@/components/admin/ProfileForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

interface FnGetProfileRow {
  id: number;
  user_id: string;
  tenant_id: number;
  email: string;
  user_name: string | null;
  full_name: string | null;
  data: { is_admin: boolean } & Record<string, unknown>;
  tenant: { id: number; code: string; name: string };
}

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data, error } = await callRpc<FnGetProfileRow[]>(supabase, 'fn_get_profile');
  const row = data?.[0];

  if (error || !row) {
    return (
      <>
        <AdminPageHeader
          icon={<User className="w-4 h-4" />}
          title="Profile"
          subtitle="Manage your account details and password."
        />
        <div className="px-4 sm:px-10 py-8">
          <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 max-w-md">
            {error ?? 'Profile not found.'}
          </p>
        </div>
      </>
    );
  }

  return (
    <ProfileForm
      profile={{
        user_name: row.user_name,
        full_name: row.full_name,
        email: row.email,
        tenant_name: row.tenant?.name ?? '',
        is_admin: !!row.data?.is_admin,
      }}
    />
  );
}
