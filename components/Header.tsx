"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { HeaderNavItem } from "@/lib/headerNav";

type HeaderProps = {
  lang: Locale;
  common: Dictionary["common"];
  labels: Dictionary["header"];
  // Resolved by the [lang] layout from website_nav_items (or its built-in
  // fallback menu) — labels already in this page's language, hrefs already
  // localized.
  nav: HeaderNavItem[];
  switcherLabel: string;
};

// The slide-in mobile menu (components.css switches to it at 1320px), where
// a parent's tap expands its children instead of following its link.
function isMobileMenu() {
  return typeof window !== "undefined" && window.innerWidth <= 1320;
}

// Plain <a> for external links, new-tab links and PDF documents; <Link> for
// everything that's a client-side navigation within the site.
function NavAnchor({
  item,
  className,
  onClick,
  children,
}: {
  item: HeaderNavItem;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}) {
  if (item.anchor) {
    return (
      <a
        className={className}
        href={item.href}
        onClick={onClick}
        target={item.newTab ? "_blank" : undefined}
        rel={item.newTab ? "noopener" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={item.href} onClick={onClick}>
      {children}
    </Link>
  );
}

export default function Header({ lang, common, labels, nav, switcherLabel }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

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
    setExpandedSub(null);
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
  const isActive = (item: HeaderNavItem) =>
    pathname === item.href || (item.matchPrefix && pathname.startsWith(item.href));
  const isParentActive = (item: HeaderNavItem) =>
    isActive(item) || (item.children?.some(isActive) ?? false);

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
              {nav.map((item) => (
                <li
                  className={`nav__item${expandedItem === item.key ? " is-expanded" : ""}`}
                  key={item.key}
                >
                  <NavAnchor
                    item={item}
                    className={`nav__link${isParentActive(item) ? " is-active" : ""}`}
                    onClick={(e) => {
                      if (item.children && isMobileMenu()) {
                        e.preventDefault();
                        setExpandedItem((cur) => (cur === item.key ? null : item.key));
                      }
                    }}
                  >
                    {item.label}
                    {item.children && (
                      <svg className="nav__caret" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M2 4.5 6 8.5 10 4.5" />
                      </svg>
                    )}
                  </NavAnchor>
                  {item.children && (
                    <ul className="nav__submenu">
                      {item.children.map((sub) =>
                        sub.children ? (
                          // Third level: a flyout beside the dropdown on
                          // desktop, an expandable group in the mobile menu.
                          <li
                            key={sub.key}
                            className={`nav__subitem${expandedSub === sub.key ? " is-expanded" : ""}`}
                          >
                            <NavAnchor
                              item={sub}
                              className={isParentActive(sub) ? "is-active" : undefined}
                              onClick={(e) => {
                                if (isMobileMenu()) {
                                  e.preventDefault();
                                  setExpandedSub((cur) => (cur === sub.key ? null : sub.key));
                                }
                              }}
                            >
                              {sub.label}
                              <svg className="nav__caret nav__caret--side" viewBox="0 0 12 12" aria-hidden="true">
                                <path d="M2 4.5 6 8.5 10 4.5" />
                              </svg>
                            </NavAnchor>
                            <ul className="nav__submenu nav__submenu--flyout">
                              {sub.children.map((leaf) => (
                                <li key={leaf.key}>
                                  <NavAnchor item={leaf} className={isActive(leaf) ? "is-active" : undefined}>
                                    {leaf.label}
                                  </NavAnchor>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ) : (
                          <li key={sub.key}>
                            <NavAnchor item={sub} className={isActive(sub) ? "is-active" : undefined}>
                              {sub.label}
                            </NavAnchor>
                          </li>
                        ),
                      )}
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
