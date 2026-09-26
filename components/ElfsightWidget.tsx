"use client";

import Script from "next/script";

// An Elfsight widget (e.g. an X feed) by its app ID. platform.js finds the
// div by class and renders the widget into it, loading lazily near viewport.
export default function ElfsightWidget({ id }: { id: string }) {
  return (
    <>
      <div className={`elfsight-app-${id}`} data-elfsight-app-lazy="" />
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
    </>
  );
}
