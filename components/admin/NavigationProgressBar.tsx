'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// App Router has no public "route change started/finished" event API (unlike
// the old Pages Router), so this intercepts internal <a> clicks to start the
// bar immediately, then treats a resolved pathname/searchParams change as
// "done" — the same technique libraries like nextjs-toploader use under the
// hood. Mounted once in (protected)/layout.tsx so it covers every admin page.
function NavigationProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const clearTimers = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    tickRef.current = null;
    safetyRef.current = null;
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 200);
  }, [clearTimers]);

  const start = useCallback(() => {
    clearTimers();
    setVisible(true);
    setProgress(15);
    // Approach the ceiling but never fake-complete — only a real
    // pathname/searchParams change (or the safety timeout) finishes it.
    tickRef.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.1));
    }, 200);
    // Failsafe: don't leave the bar stuck if navigation never resolves
    // (e.g. hash-only link, cancelled navigation, an error before redirect).
    safetyRef.current = setTimeout(finish, 8000);
  }, [clearTimers, finish]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || anchor.target === '_blank') return;
      if (anchor.origin !== window.location.origin) return;
      const isSamePage =
        anchor.pathname === window.location.pathname && anchor.search === window.location.search;
      if (isSamePage) return;
      start();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [start]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    finish();
  }, [pathname, searchParams, finish]);

  useEffect(() => clearTimers, [clearTimers]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 pointer-events-none">
      <div
        className="h-full bg-primary-500 transition-[width] duration-200 ease-out shadow-[0_0_8px_rgba(22,163,74,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBarInner />
    </Suspense>
  );
}
