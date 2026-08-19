// Lightweight, dependency-free User-Agent parsing for /api/analytics —
// intentionally not exhaustive (no full UA-database lookup), just enough to
// bucket pageviews into a handful of browser/OS/device categories for the
// dashboard's device breakdown. Order matters: Edge and Opera both include
// "Chrome" in their UA string, so those checks must run before the Chrome
// check, and Chrome's UA includes "Safari" so that must run before Safari.
export interface ParsedUserAgent {
  browser: string | null;
  os: string | null;
  deviceType: 'mobile' | 'tablet' | 'desktop' | null;
}

export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua) return { browser: null, os: null, deviceType: null };

  let browser: string | null = null;
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome\//i.test(ua)) browser = 'Chrome';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';
  else if (/safari\//i.test(ua)) browser = 'Safari';
  else if (/msie|trident/i.test(ua)) browser = 'Internet Explorer';

  let os: string | null = null;
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let deviceType: ParsedUserAgent['deviceType'] = 'desktop';
  if (/ipad|tablet/i.test(ua)) deviceType = 'tablet';
  else if (/mobi|iphone|android/i.test(ua)) deviceType = 'mobile';

  return { browser, os, deviceType };
}
