import Link from "next/link";
import FooterYear from "./FooterYear";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__main">
          <div>
            <div className="footer__brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="IFFCO Kisan SEZ logo" width={130} height={52} />
              <span className="brand__text">
                <span className="brand__name">IFFCO Kisan SEZ</span>
                <span className="brand__tag">Integrated Agropark</span>
              </span>
            </div>
            <p>
              IFFCO Kisan SEZ is being setup as an Agribusiness Special Economic Zone based on the
              concept of Integrated Agropark.
            </p>
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
            <p className="footer__title">Explore</p>
            <ul className="footer__links">
              <li>
                <Link href="/about-us/">About us</Link>
              </li>
              <li>
                <Link href="/agropark/">Agropark</Link>
              </li>
              <li>
                <Link href="/benefits/">Benefits</Link>
              </li>
              <li>
                <Link href="/invitation-for-investors/">Business Opportunities</Link>
              </li>
              <li>
                <Link href="/industrial/">Infrastructure</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer__title">Information</p>
            <ul className="footer__links">
              <li>
                <Link href="/master-plan/">Master Plan</Link>
              </li>
              <li>
                <Link href="/existing-units/">Existing units</Link>
              </li>
              <li>
                <Link href="/news-and-events/">News and Events</Link>
              </li>
              <li>
                <Link href="/gallery/">Image Gallery</Link>
              </li>
              <li>
                <Link href="/blog/">Blog</Link>
              </li>
              <li>
                <Link href="/compliances/">Compliance Documents</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer__title">Get in touch</p>
            <p>
              <strong style={{ color: "#fff" }}>IFFCO Kisan SEZ Limited</strong>
            </p>
            <address className="footer__address">
              Project Office, Village &amp; Post: Racharlapadu,
              <br />
              Adjacent to NH-16, Kodavaluru Mandalam,
              <br />
              District: SPSR Nellore, Pin Code: 524319 (A.P)
            </address>
            <p className="footer__address" style={{ marginTop: "1rem" }}>
              Mobile: <a href="tel:+919652993599">+91-9652993599</a>
              <br />
              E-mail: <a href="mailto:ceooffice@iffcosez.in">ceooffice@iffcosez.in</a>
            </p>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="mb-0">
            &copy; <FooterYear /> IFFCO Kisan SEZ Limited. All rights reserved.
          </p>
          <Link href="/privacy-policy/">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
