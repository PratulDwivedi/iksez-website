"use client";

import { useState } from "react";

export interface GalleryTab {
  label: string;
  images: string[];
}

// Tabbed photo carousel from IFFCO's leadership profiles: one large centred
// photo with the previous/next photos peeking in, smaller, at either side.
export default function LeaderGallery({ tabs }: { tabs: GalleryTab[] }) {
  const [tab, setTab] = useState(0);
  const [index, setIndex] = useState(0);
  const images = tabs[tab].images;
  const at = (i: number) => images[((i % images.length) + images.length) % images.length];

  const selectTab = (i: number) => {
    setTab(i);
    setIndex(0);
  };

  return (
    <div className="leader-gallery">
      <div className="leader-gallery__tabs" role="tablist">
        {tabs.map((t, i) => (
          <button
            type="button"
            role="tab"
            aria-selected={i === tab}
            className={i === tab ? "is-active" : undefined}
            key={t.label}
            onClick={() => selectTab(i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="leader-gallery__stage" role="tabpanel" aria-label={tabs[tab].label}>
        {/* eslint-disable @next/next/no-img-element */}
        <img className="leader-gallery__side" src={at(index - 1)} alt="" aria-hidden="true" />
        <div className="leader-gallery__main">
          <button type="button" className="leader-gallery__arrow leader-gallery__arrow--prev" aria-label="Previous photo" onClick={() => setIndex((i) => i - 1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
          </button>
          <img src={at(index)} alt={`${tabs[tab].label} — photo ${(((index % images.length) + images.length) % images.length) + 1} of ${images.length}`} />
          <button type="button" className="leader-gallery__arrow leader-gallery__arrow--next" aria-label="Next photo" onClick={() => setIndex((i) => i + 1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
          </button>
        </div>
        <img className="leader-gallery__side" src={at(index + 1)} alt="" aria-hidden="true" />
        {/* eslint-enable @next/next/no-img-element */}
      </div>
    </div>
  );
}
