"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Site-wide behaviours ported from the original assets/js/main.js, adapted
 * for an SPA lifecycle instead of a full page reload per navigation:
 *  - scroll reveal / animated counters re-scan the DOM on every route change
 *  - accordion + lightbox use event delegation on `document`, so they work
 *    for whatever page is currently mounted without per-route rebinding
 *  - back-to-top is mounted once for the app's lifetime
 */
export default function SiteEffects() {
  const pathname = usePathname();
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxIndexRef = useRef(0);

  // Scroll reveal + animated counters — re-run per route.
  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let revealObserver: IntersectionObserver | null = null;

    if (revealItems.length) {
      if (!("IntersectionObserver" in window)) {
        revealItems.forEach((el) => el.classList.add("is-visible"));
      } else {
        revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-visible");
              revealObserver?.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );

        revealItems.forEach((el, i) => {
          if (!el.style.getPropertyValue("--reveal-delay")) {
            const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
            const sibIndex = siblings.indexOf(el);
            el.style.setProperty("--reveal-delay", `${Math.min(sibIndex < 0 ? i : sibIndex, 6) * 70}ms`);
          }
          revealObserver!.observe(el);
        });
      }
    }

    const counterItems = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    let counterObserver: IntersectionObserver | null = null;

    if (counterItems.length && "IntersectionObserver" in window) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            counterObserver?.unobserve(el);

            const target = parseFloat(el.dataset.count || "0");
            const decimals = (el.dataset.count?.split(".")[1] || "").length;
            const prefix = el.dataset.prefix || "";
            const suffix = el.dataset.suffix || "";
            const fmt = (v: number) =>
              prefix +
              v.toLocaleString("en-IN", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              }) +
              suffix;

            if (reduce) {
              el.textContent = fmt(target);
              return;
            }

            const start = performance.now();
            const DUR = 1500;
            const step = (now: number) => {
              const p = Math.min((now - start) / DUR, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = fmt(target * eased);
              if (p < 1) requestAnimationFrame(step);
              else el.textContent = fmt(target);
            };
            requestAnimationFrame(step);
          });
        },
        { threshold: 0.4 }
      );

      counterItems.forEach((el) => counterObserver!.observe(el));
    }

    return () => {
      revealObserver?.disconnect();
      counterObserver?.disconnect();
    };
  }, [pathname]);

  // Accordion + lightbox (event delegation) + back-to-top — mounted once.
  useEffect(() => {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous">&#8249;</button>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next">&#8250;</button>' +
      "<div><img alt=\"\"><div class=\"lightbox__cap\"></div></div>";
    document.body.appendChild(box);
    lightboxRef.current = box;

    const img = box.querySelector("img")!;
    const cap = box.querySelector(".lightbox__cap") as HTMLElement;

    const getTriggers = () => Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-lightbox]"));

    const show = (i: number) => {
      const triggers = getTriggers();
      if (!triggers.length) return;
      const index = ((i % triggers.length) + triggers.length) % triggers.length;
      lightboxIndexRef.current = index;
      const a = triggers[index];
      img.src = a.getAttribute("href") || "";
      img.alt = a.dataset.caption || "";
      cap.textContent = a.dataset.caption || "";
      cap.style.display = a.dataset.caption ? "" : "none";
    };
    const open = (i: number) => {
      show(i);
      box.classList.add("is-open");
      document.body.classList.add("is-locked");
    };
    const close = () => {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
    };

    box.querySelector(".lightbox__close")?.addEventListener("click", close);
    box.querySelector(".lightbox__nav--prev")?.addEventListener("click", () => show(lightboxIndexRef.current - 1));
    box.querySelector(".lightbox__nav--next")?.addEventListener("click", () => show(lightboxIndexRef.current + 1));
    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const lightboxTrigger = target.closest<HTMLAnchorElement>("[data-lightbox]");
      if (lightboxTrigger) {
        e.preventDefault();
        const triggers = getTriggers();
        open(triggers.indexOf(lightboxTrigger));
        return;
      }

      const accordionBtn = target.closest<HTMLButtonElement>(".accordion__btn");
      if (accordionBtn) {
        const acc = accordionBtn.closest(".accordion");
        const panel = document.getElementById(accordionBtn.getAttribute("aria-controls") || "");
        const isOpenNow = accordionBtn.getAttribute("aria-expanded") === "true";
        const single = acc?.getAttribute("data-single") === "true";

        if (single && !isOpenNow) {
          acc?.querySelectorAll(".accordion__btn").forEach((b) => {
            b.setAttribute("aria-expanded", "false");
            const p = document.getElementById(b.getAttribute("aria-controls") || "");
            p?.classList.remove("is-open");
          });
        }
        accordionBtn.setAttribute("aria-expanded", String(!isOpenNow));
        panel?.classList.toggle("is-open", !isOpenNow);
      }
    };
    document.addEventListener("click", onDocClick);

    const onKeydown = (e: KeyboardEvent) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(lightboxIndexRef.current - 1);
      if (e.key === "ArrowRight") show(lightboxIndexRef.current + 1);
    };
    document.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeydown);
      box.remove();
    };
  }, []);

  return null;
}
