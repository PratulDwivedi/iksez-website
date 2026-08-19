'use server';

import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';

export async function resetApiKey(): Promise<{ key: string | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await callRpc<Array<{ x_api_key: string }>>(
    supabase,
    'fn_reset_api_key'
  );
  return { key: data?.[0]?.x_api_key ?? null, error };
}

export async function resetPublishableApiKey(): Promise<{ key: string | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await callRpc<Array<{ x_publishable_api_key: string }>>(
    supabase,
    'fn_reset_publishable_api_key'
  );
  return { key: data?.[0]?.x_publishable_api_key ?? null, error };
}
