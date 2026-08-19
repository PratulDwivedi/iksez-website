"use client";

import { useEffect, useState } from "react";

export default function FooterYear() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    // Client-only, hydration-safe read of the current year (mirrors the
    // original static site's <span data-year> filled in by main.js after load).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  return <span data-year>{year}</span>;
}
