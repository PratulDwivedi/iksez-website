import { Fragment } from "react";
import Link from "next/link";
import FooterYear from "./FooterYear";
import ThemeToggle from "./ThemeToggle";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

type FooterProps = {
  lang: Locale;
  common: Dictionary["common"];
  labels: Dictionary["footer"];
};

export default function Footer({ lang, common, labels }: FooterProps) {
  const href = (path: string) => localizePath(path, lang);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__main">
          <div>
            <div className="footer__brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt={common.logoAlt} width={130} height={52} />
              <span className="brand__text">
                <span className="brand__name">{common.brandName}</span>
                <span className="brand__tag">{common.brandTag}</span>
              </span>
            </div>
            <p className="footer__description">{labels.description}</p>
            <div className="footer__social">
              <a
                href="https://www.facebook.com/IKSEZ.PR"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
                </svg>
              </a>
              <a href="https://twitter.com/IKSEZ" target="_blank" rel="noopener" aria-label="Twitter">
                <svg viewBox="0 0 24 24">
                  <path d="M18.9 5h2.6l-5.7 6.5 6.7 8.8h-5.2l-4.1-5.4-4.7 5.4H5.9l6.1-7L5.6 5h5.4l3.7 4.9L18.9 5zm-.9 13.8h1.4L9.1 6.4H7.6l10.4 12.4z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <p className="footer__title">{labels.exploreTitle}</p>
            <ul className="footer__links">
              <li>
                <Link href={href("/about-us/")}>{labels.links.about}</Link>
              </li>
              <li>
                <Link href={href("/agropark/")}>{labels.links.agropark}</Link>
              </li>
              <li>
                <Link href={href("/benefits/")}>{labels.links.benefits}</Link>
              </li>
              <li>
                <Link href={href("/invitation-for-investors/")}>{labels.links.businessOpportunities}</Link>
              </li>
              <li>
                <Link href={href("/industrial/")}>{labels.links.infrastructure}</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer__title">{labels.informationTitle}</p>
            <ul className="footer__links">
              <li>
                <Link href={href("/master-plan/")}>{labels.links.masterPlan}</Link>
              </li>
              <li>
                <Link href={href("/existing-units/")}>{labels.links.existingUnits}</Link>
              </li>
              <li>
                <Link href={href("/news-and-events/")}>{labels.links.newsEvents}</Link>
              </li>
              <li>
                <Link href={href("/gallery/")}>{labels.links.gallery}</Link>
              </li>
              <li>
                <Link href={href("/blog/")}>{labels.links.blog}</Link>
              </li>
              <li>
                <Link href={href("/reports-policies/compliances/")}>{labels.links.compliances}</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer__title">{labels.contactTitle}</p>
            <p>
              <strong style={{ color: "#17234d" }}>{labels.companyName}</strong>
            </p>
            <address className="footer__address">
              {labels.addressLines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </address>
            <p className="footer__address" style={{ marginTop: "1rem" }}>
              {labels.mobileLabel}: <a href="tel:+919652993599">+91-9652993599</a>
              <br />
              {labels.emailLabel}: <a href="mailto:ceooffice@iffcosez.in">ceooffice@iffcosez.in</a>
            </p>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="mb-0">
            &copy; <FooterYear /> {labels.rightsReserved}
          </p>
          <div className="footer__controls">
            <Link href={href("/privacy-policy/")}>{labels.links.privacyPolicy}</Link>
            <Link className="footer__admin" href="/admin/" aria-label={labels.adminAriaLabel} title={labels.adminTitle}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
