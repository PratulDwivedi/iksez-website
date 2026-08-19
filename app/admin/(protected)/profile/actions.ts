'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';

export async function saveProfile(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient();

  const { error } = await callRpc(supabase, 'fn_save_user_profile', {
    p_email: formData.get('email'),
    p_user_name: formData.get('user_name'),
    p_full_name: formData.get('full_name'),
  });

  if (error) {
    return { error, success: false };
  }

  revalidatePath('/admin/profile');
  return { error: null, success: true };
}

export async function changePassword(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.', success: false };
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.', success: false };
  }

  const supabase = await createClient();
  // No re-entry of the current password: Supabase's updateUser() relies on
  // the caller already holding a valid session, same as every other
  // authenticated action in this panel.
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}
