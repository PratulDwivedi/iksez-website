"use client";

import Script from "next/script";
import { useRef } from "react";

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: HTMLElement) => void } };
  }
}

// X's official post embeds (profile-timeline embeds no longer render).
// widgets.js swaps each blockquote for a live post card; if X fails to load,
// the blockquotes stay as plain links to the posts.
export default function XPosts({ handle, postIds }: { handle: string; postIds: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="x-posts" ref={ref}>
      {postIds.map((id) => (
        <blockquote className="twitter-tweet" data-dnt="true" key={id}>
          <a href={`https://twitter.com/${handle}/status/${id}`}>View this post by @{handle} on X</a>
        </blockquote>
      ))}
      {/* On client-side navigation the script is already loaded, so onReady
          (not onLoad) is what re-scans these blockquotes. */}
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onReady={() => window.twttr?.widgets?.load(ref.current ?? undefined)}
      />
    </div>
  );
}
