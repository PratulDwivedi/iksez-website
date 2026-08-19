import { createClient } from '@supabase/supabase-js';

export interface TrackEventParams {
  event_type?: string;
  event_name?: string;
  url?: string;
  path?: string;
  referrer?: string;
  title?: string;
  visitor_id?: string;
  session_id?: string;
  browser?: string | null;
  os?: string | null;
  device_type?: string | null;
  country?: string | null;
  user_agent?: string;
  data?: Record<string, unknown>;
  // Forwarded from the caller's own x-api-key (see src/app/api/analytics/route.ts),
  // same as publicLeads.ts — required, no keyless default, since a tracking
  // hit has to be attributed to a real tenant.
  apiKey: string;
}

export interface TrackEventResult {
  is_success: boolean;
  message: string;
  status_code: number;
  data: Array<{ id: number }>;
}

function rpcClient(apiKey?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    apiKey ? { global: { headers: { 'x-api-key': apiKey } } } : undefined
  );
}

export async function trackEvent(params: TrackEventParams): Promise<TrackEventResult> {
  const supabase = rpcClient(params.apiKey);
  const { data: envelope, error } = await supabase.rpc('fn_track_website_event', {
    p_event_type: params.event_type || 'pageview',
    p_event_name: params.event_name || null,
    p_url: params.url || null,
    p_path: params.path || null,
    p_referrer: params.referrer || null,
    p_title: params.title || null,
    p_visitor_id: params.visitor_id || null,
    p_session_id: params.session_id || null,
    p_browser: params.browser || null,
    p_os: params.os || null,
    p_device_type: params.device_type || null,
    p_country: params.country || null,
    p_user_agent: params.user_agent || null,
    p_data: params.data ?? {},
  });

  if (error) {
    return { is_success: false, message: error.message, status_code: 500, data: [] };
  }

  return envelope as TrackEventResult;
}
