"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

type NavLabelKey = keyof Dictionary["header"]["nav"];

type NavItem = {
  key: NavLabelKey;
  href: string;
  submenu?: { key: NavLabelKey; href: string }[];
};

// Locale-neutral hrefs; localized per render via localizePath() so the
// Telugu site's nav stays on /te/... URLs.
const NAV: NavItem[] = [
  { key: "about", href: "/about-us/" },
  { key: "leadership", href: "/board-of-directors/" },
  {
    key: "zones",
    href: "/zone/sez/",
    submenu: [
      { key: "sez", href: "/zone/sez/" },
      { key: "dtz", href: "/zone/dtz/" },
    ],
  },
  {
    key: "reportsPolicies",
    href: "/reports-policies/",
    submenu: [
      { key: "annualReports", href: "/reports-policies/#annual-reports" },
      { key: "csr", href: "/reports-policies/#csr" },
      { key: "policies", href: "/reports-policies/#policies" },
      { key: "compliances", href: "/compliances/" },
    ],
  },
  { key: "newsMedia", href: "/news-and-events/" },
  { key: "blogs", href: "/blog/" },
  { key: "contact", href: "/contact-us/" },
];

type HeaderProps = {
  lang: Locale;
  common: Dictionary["common"];
  labels: Dictionary["header"];
  switcherLabel: string;
};

export default function Header({ lang, common, labels, switcherLabel }: HeaderProps) {
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

  const href = (path: string) => localizePath(path, lang);

  // With trailingSlash routing, hrefs like "/about-us/" (or "/te/about-us/")
  // match usePathname() exactly — no suffix-stripping needed.
  const isActive = (path: string) => pathname === href(path);
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
          <LanguageSwitcher lang={lang} ariaLabel={switcherLabel} />
        </div>
      </div>
      <header className={`site-header${isStuck ? " is-stuck" : ""}`}>
        <div className="container">
          <nav className="nav" aria-label="Primary">
            <Link className="brand" href={href("/")} aria-label={common.homeAriaLabel}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt={common.logoAlt} width={120} height={46} />
              <span className="brand__text">
                <span className="brand__name">{common.brandName}</span>
                <span className="brand__tag">{common.brandTag}</span>
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
                    href={href(item.href)}
                    onClick={(e) => {
                      if (item.submenu && typeof window !== "undefined" && window.innerWidth <= 1120) {
                        e.preventDefault();
                        setExpandedItem((cur) => (cur === item.href ? null : item.href));
                      }
                    }}
                  >
                    {labels.nav[item.key]}
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
                          <Link href={href(sub.href)} className={isActive(sub.href) ? "is-active" : undefined}>
                            {labels.nav[sub.key]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="nav__actions">
              <button
                className="nav__toggle"
                type="button"
                aria-label={labels.menu}
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
