export interface XProfileStats {
  posts: number;
  following: number;
  followers: number;
}

const SIX_HOURS = 6 * 60 * 60;

// Live Posts / Following / Followers counts for an X profile, read from the
// public data behind X's own embed widgets (no API key or paid plan needed).
// That endpoint is unofficial, so any failure — network, markup change,
// rate limit — returns null and the page just leaves the counts out.
// The counts are cached and refreshed at most every six hours.
export async function getXProfileStats(handle: string): Promise<XProfileStats | null> {
  try {
    const res = await fetch(`https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(handle)}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IKSEZ-Website)" },
      next: { revalidate: SIX_HOURS },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) return null;
    const data = JSON.parse(match[1]);
    const user = data?.props?.pageProps?.timeline?.entries?.find(
      (e: { content?: { tweet?: { user?: { screen_name?: string } } } }) =>
        e.content?.tweet?.user?.screen_name?.toLowerCase() === handle.toLowerCase(),
    )?.content.tweet.user;
    if (!user || typeof user.followers_count !== "number") return null;
    return { posts: user.statuses_count, following: user.friends_count, followers: user.followers_count };
  } catch {
    return null;
  }
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** Formats a count the way X does: 21, 15.8K, 1.2M. */
export function formatXCount(n: number): string {
  return compact.format(n);
}
