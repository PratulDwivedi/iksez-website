import type { SupabaseClient } from '@supabase/supabase-js';

// Every DB function under supabase/functions/ returns this envelope via
// fn_response_success/fn_response_error (see supabase/README.md) — this
// unwraps it the same way artificial-wit-web-apps' HttpHelper.rpc does,
// minus the custom-gateway transport (this calls supabase.rpc() directly)
// and the token/cache machinery (handled by @supabase/ssr's cookie-based
// session instead).
export interface RpcEnvelope<T> {
  is_success: boolean;
  data: T;
  message: string;
  status_code?: number;
}

export async function callRpc<T = unknown>(
  supabase: SupabaseClient,
  fn: string,
  params: Record<string, unknown> = {}
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.rpc(fn, params);

  if (error) {
    // Postgres-level error (network/permission/syntax) — the DB functions
    // normally catch their own exceptions and return a structured envelope
    // instead, so this path is mostly a defensive fallback.
    return { data: null, error: error.message };
  }

  const envelope = data as RpcEnvelope<T>;
  if (!envelope?.is_success) {
    return { data: null, error: envelope?.message ?? 'Unknown error' };
  }

  return { data: envelope.data, error: null };
}
