import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact us | IFFCO Kisan SEZ",
  description:
    "Contact IFFCO Kisan SEZ Limited — Project Office at Racharlapadu, adjacent to NH-16, Kodavaluru Mandalam, SPSR Nellore, Andhra Pradesh.",
};

export default function ContactUs() {
  return (
    <>
      <PageHero
        title="Contact us"
        subtitle="Talk to the IKSEZ team about setting up your unit."
        banner="/images/contact-banner.png"
      />

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            {/* ---------- FORM ---------- */}
            <div className="contact-card" data-reveal="">
              <h3>Send us a message</h3>
              <ContactForm />
            </div>

            {/* ---------- DETAILS ---------- */}
            <div className="stack" data-reveal="">
              <div className="contact-card">
                <h3>IFFCO Kisan SEZ Limited</h3>
                <ul className="contact-list">
                  <li>
                    <span className="contact-list__icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
                        <circle cx="12" cy="10" r="2.6" />
                      </svg>
                    </span>
                    <address>
                      Project Office, Village &amp; Post: Racharlapadu,
                      <br />
                      Adjacent to NH-16, Kodavaluru Mandalam,
                      <br />
                      District: SPSR Nellore, Pin Code: 524319 (A.P)
                    </address>
                  </li>
                  <li>
                    <span className="contact-list__icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                      </svg>
                    </span>
                    <span>
                      Mobile: <a href="tel:+919652993599">+91-9652993599</a>
                    </span>
                  </li>
                  <li>
                    <span className="contact-list__icon">
                      <svg viewBox="0 0 24 24">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m2 7 10 6 10-6" />
                      </svg>
                    </span>
                    <span>
                      E-mail: <a href="mailto:ceooffice@iffcosez.in">ceooffice@iffcosez.in</a>
                    </span>
                  </li>
                  <li>
                    <span className="contact-list__icon">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
                      </svg>
                    </span>
                    <span>
                      Website:{" "}
                      <a href="https://www.iksez.com" target="_blank" rel="noopener">
                        www.iksez.com
                      </a>
                    </span>
                  </li>
                </ul>
              </div>

              <div className="contact-card">
                <h3>Registered Office</h3>
                <ul className="contact-list">
                  <li>
                    <span className="contact-list__icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M3 21h18M5 21V7l7-4 7 4v14" />
                        <path d="M9 21v-5h6v5M9 11h.01M15 11h.01" />
                      </svg>
                    </span>
                    <address>
                      IFFCO Sadan, C-1,
                      <br />
                      District Centre, Saket Place,
                      <br />
                      Saket, New Delhi-110017
                    </address>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
