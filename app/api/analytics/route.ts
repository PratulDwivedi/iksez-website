import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/publicAnalytics';
import { parseUserAgent } from '@/lib/userAgent';

export const dynamic = 'force-dynamic';

// Public "collect" endpoint — the Google-Analytics-style tracking hit. Any
// tenant's site (including a third-party integrator's own pages) POSTs a
// pageview/event here with its own Publishable API Key in x-api-key, same
// integration shape as /api/leads: write-only, key required, no keyless
// tenant default (see fn_track_website_event.sql). Browser/OS/device are
// parsed server-side from the User-Agent header rather than trusting a
// client-reported value, and Vercel's edge-injected geo headers are forwarded
// (country into its own column; region/city/lat-long/timezone into `data`,
// see buildGeoData below — no-op off Vercel, those headers simply won't
// exist there, same as the pre-existing country handling). Deliberately does
// NOT capture the visitor's raw IP address — coarse city/region-level geo is
// enough for the dashboard, and skipping IP avoids storing directly
// identifying data / the extra data-protection disclosure burden that comes
// with it.
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key') ?? undefined;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { is_success: false, message: 'Invalid JSON body', status_code: 400, data: [] },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { is_success: false, message: 'x-api-key header is required', status_code: 401, data: [] },
      { status: 401 }
    );
  }

  const path = asString(body.path);
  const url = asString(body.url);
  if (!path?.trim() && !url?.trim()) {
    return NextResponse.json(
      { is_success: false, message: 'path or url is required', status_code: 400, data: [] },
      { status: 400 }
    );
  }

  const userAgent = request.headers.get('user-agent') ?? undefined;
  const { browser, os, deviceType } = parseUserAgent(userAgent);
  const country = request.headers.get('x-vercel-ip-country') ?? undefined;

  const callerData = isPlainObject(body.data) ? body.data : {};
  const geo = buildGeoData(request);
  const data = Object.keys(geo).length > 0 ? { ...callerData, geo } : callerData;

  const result = await trackEvent({
    apiKey,
    event_type: asString(body.event_type),
    event_name: asString(body.event_name),
    url,
    path,
    referrer: asString(body.referrer),
    title: asString(body.title),
    visitor_id: asString(body.visitor_id),
    session_id: asString(body.session_id),
    browser,
    os,
    device_type: deviceType,
    country,
    user_agent: userAgent,
    data: Object.keys(data).length > 0 ? data : undefined,
  });

  return NextResponse.json(result, { status: result.status_code || 200 });
}

// Stored under data.geo (jsonb) rather than new columns — see
// website_analytics_events.sql's `data jsonb` column, kept generic on
// purpose for exactly this kind of incremental field addition. No IP address
// here on purpose — see the POST handler comment above.
function buildGeoData(request: NextRequest): Record<string, string> {
  const geo: Record<string, string> = {};
  const region = request.headers.get('x-vercel-ip-country-region');
  const city = request.headers.get('x-vercel-ip-city');
  const latitude = request.headers.get('x-vercel-ip-latitude');
  const longitude = request.headers.get('x-vercel-ip-longitude');
  const timezone = request.headers.get('x-vercel-ip-timezone');

  if (region) geo.region = region;
  if (city) geo.city = decodeURIComponent(city);
  if (latitude) geo.latitude = latitude;
  if (longitude) geo.longitude = longitude;
  if (timezone) geo.timezone = timezone;

  return geo;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
