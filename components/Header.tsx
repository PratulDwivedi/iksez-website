"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

type NavItem = {
  label: string;
  href: string;
  submenu?: { label: string; href: string }[];
};

const NAV: NavItem[] = [
  { label: "About Us", href: "/about-us/" },
  { label: "Leadership", href: "/board-of-directors/" },
  {
    label: "Zones",
    href: "/zone/sez/",
    submenu: [
      { label: "SEZ", href: "/zone/sez/" },
      { label: "DTZ", href: "/zone/dtz/" },
    ],
  },
  {
    label: "Reports & Policies",
    href: "/reports-policies/",
    submenu: [
      { label: "Annual Reports", href: "/reports-policies/#annual-reports" },
      { label: "CSR", href: "/reports-policies/#csr" },
      { label: "Policies", href: "/reports-policies/#policies" },
      { label: "Compliances", href: "/compliances/" },
    ],
  },
  { label: "News & Media", href: "/news-and-events/" },
  { label: "Blogs", href: "/blog/" },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Reset mobile-menu UI state after a client-side route change (Link
    // navigations don't remount Header, so this wouldn't otherwise reset).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
    setExpandedItem(null);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("is-locked", isOpen);
  }, [isOpen]);

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 1320) setIsOpen(false);
    };
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // With trailingSlash routing, hrefs like "/about-us/" match usePathname()
  // exactly — no suffix-stripping needed.
  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) =>
    isActive(item.href) || (item.submenu?.some((s) => isActive(s.href)) ?? false);

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__meta">
            <a href="tel:+9118001234567">+91-9652993599</a>
            <a href="mailto:ceooffice@iffcosez.in">ceooffice@iffcosez.in</a>
          </div>
          <div className="topbar__languages" aria-label="Language selection">
            <span className="is-active">English</span>
            <span aria-label="Telugu language coming soon">తెలుగు</span>
          </div>
        </div>
      </div>
      <header className={`site-header${isStuck ? " is-stuck" : ""}`}>
        <div className="container">
          <nav className="nav" aria-label="Primary">
            <Link className="brand" href="/" aria-label="IFFCO Kisan SEZ — Home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="IFFCO Kisan SEZ logo" width={120} height={46} />
              <span className="brand__text">
                <span className="brand__name">IFFCO Kisan SEZ</span>
                <span className="brand__tag">Integrated Agropark</span>
              </span>
            </Link>

            <ul className={`nav__menu${isOpen ? " is-open" : ""}`} id="primary-menu">
              {NAV.map((item) => (
                <li
                  className={`nav__item${expandedItem === item.href ? " is-expanded" : ""}`}
                  key={item.href}
                >
                  <Link
                    className={`nav__link${isParentActive(item) ? " is-active" : ""}`}
                    href={item.href}
                    onClick={(e) => {
                      if (item.submenu && typeof window !== "undefined" && window.innerWidth <= 1120) {
                        e.preventDefault();
                        setExpandedItem((cur) => (cur === item.href ? null : item.href));
                      }
                    }}
                  >
                    {item.label}
                    {item.submenu && (
                      <svg className="nav__caret" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M2 4.5 6 8.5 10 4.5" />
                      </svg>
                    )}
                  </Link>
                  {item.submenu && (
                    <ul className="nav__submenu">
                      {item.submenu.map((sub) => (
                        <li key={sub.href}>
                          <Link href={sub.href} className={isActive(sub.href) ? "is-active" : undefined}>
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="nav__actions">
              <Link className="nav__admin" href="/admin/" aria-label="Open admin dashboard" title="Admin dashboard">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </Link>
              <ThemeToggle />
              <Link className="btn btn--brand btn--sm" href="/contact-us/">
                Contact Us
              </Link>
              <Link className="nav__contact" href="/contact-us/" aria-label="Contact us">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z" />
                </svg>
              </Link>
              <button
                className="nav__toggle"
                type="button"
                aria-label="Menu"
                aria-expanded={isOpen}
                aria-controls="primary-menu"
                onClick={() => setIsOpen((v) => !v)}
              >
                <span></span>
              </button>
            </div>
          </nav>
        </div>
      </header>
      <div
        className={`nav-scrim${isOpen ? " is-open" : ""}`}
        role="presentation"
        onClick={() => setIsOpen(false)}
      ></div>
    </>
  );
}
