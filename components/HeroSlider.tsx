"use client";

import { useEffect, useRef, useState } from "react";

const DELAY = 6000;

export default function HeroSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  // Only the first slide's background loads eagerly (it's preloaded as the
  // LCP candidate); the rest load once the browser is idle so they don't
  // compete with critical-path requests during initial page load.
  const [revealed, setRevealed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (i: number) => setIndex(((i % images.length) + images.length) % images.length);

  const restart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIndex((cur) => (cur + 1) % images.length), DELAY);
  };

  useEffect(() => {
    if (images.length < 2) return;
    restart();
    const onVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        restart();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  useEffect(() => {
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 200);
    idle(() => setRevealed(images.length));
  }, [images.length]);

  // Defensive: make sure the active slide is always loaded even if autoplay
  // reaches it before the idle callback above has fired.
  useEffect(() => {
    setRevealed((r) => Math.max(r, index + 1));
  }, [index]);

  return (
    <div className="hero__media">
      <div
        className="hero__slides"
        aria-hidden="true"
        onMouseEnter={() => timerRef.current && clearInterval(timerRef.current)}
        onMouseLeave={restart}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className={`hero__slide${i === index ? " is-active" : ""}`}
            style={i < revealed ? { backgroundImage: `url('${src}')` } : undefined}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="hero__dots" role="tablist" aria-label="Slides">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`hero__dot${i === index ? " is-active" : ""}`}
              aria-label={`Show slide ${i + 1}`}
              onClick={() => {
                go(i);
                restart();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
