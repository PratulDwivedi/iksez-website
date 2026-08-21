import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy | IFFCO Kisan SEZ",
  description:
    "Learn how IFFCO Kisan SEZ Limited collects, uses, and protects information shared through the IKSEZ website.",
};

export default function PrivacyPolicy() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        subtitle="Your privacy matters to IFFCO Kisan SEZ Limited. This policy explains how we handle information shared through this website."
        banner="/images/about-us-banner.webp"
      />

      <section className="section">
        <div className="container container--narrow">
          <article className="legal-content">
            <p className="legal-content__updated">Last updated: August 21, 2026</p>

            <h2>Introduction</h2>
            <p>
              IFFCO Kisan SEZ Limited (&quot;IKSEZ&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and
              is committed to protecting the information you share with us. This Privacy Policy
              explains how information is collected, used, and protected when you visit
              <a href="https://www.iksez.com"> www.iksez.com</a> or contact us through the website.
            </p>

            <h2>Information We Collect</h2>
            <p>We may collect the following information when you use this website:</p>
            <ul>
              <li>
                <strong>Information you provide:</strong> your name, email address, phone number,
                subject, and message when you contact us.
              </li>
              <li>
                <strong>Technical information:</strong> information such as your IP address,
                browser type, device, pages visited, and approximate usage times.
              </li>
              <li>
                <strong>Analytics information:</strong> page visits and session information used
                to understand website usage and improve the site, where analytics is enabled.
              </li>
            </ul>

            <h2>How We Use Information</h2>
            <p>We use information collected through the website to:</p>
            <ul>
              <li>Respond to enquiries and provide requested information.</li>
              <li>Maintain, secure, and improve the website.</li>
              <li>Understand website traffic and content performance.</li>
              <li>Comply with applicable laws and protect our rights.</li>
            </ul>

            <h2>Contact Forms and Email</h2>
            <p>
              When you submit the contact form, your email application is opened with the details
              you entered so you can send the enquiry to our office. Please review the recipient
              and message before sending. We use enquiry information only to respond to and manage
              your communication.
            </p>

            <h2>Cookies and Analytics</h2>
            <p>
              The website may use essential browser storage and analytics technologies to operate
              the site and understand visits. Analytics may use a visitor identifier and session
              identifier. You can control cookies and local storage through your browser settings,
              although disabling them may affect some website functionality.
            </p>

            <h2>Sharing of Information</h2>
            <p>
              We do not sell your personal information. We may share information with service
              providers that help us host, secure, maintain, or analyze the website, or when
              disclosure is required by law, legal process, or to protect the rights and safety of
              IKSEZ, our visitors, or others.
            </p>

            <h2>Data Security and Retention</h2>
            <p>
              We use reasonable administrative, technical, and organizational measures to protect
              information. No method of transmission or storage is completely secure. We retain
              information only for as long as reasonably necessary for the purposes described in
              this policy, to resolve disputes, and to meet legal obligations.
            </p>

            <h2>Third-Party Links</h2>
            <p>
              This website may link to third-party websites or documents. Their privacy practices
              are governed by their own policies, and IKSEZ is not responsible for their content or
              privacy practices.
            </p>

            <h2>Your Rights</h2>
            <p>
              Depending on applicable law, you may ask us to provide, correct, or delete personal
              information we hold about you. To make a request or ask a question about this policy,
              contact us using the details below.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The updated version will be
              posted on this page with a revised date.
            </p>

            <h2>Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, contact:</p>
            <address>
              <strong>IFFCO Kisan SEZ Limited</strong>
              <br />
              Project Office, Village &amp; Post: Racharlapadu,
              <br />
              Adjacent to NH-16, Kodavaluru Mandalam,
              <br />
              District: SPSR Nellore, Pin Code: 524319 (A.P)
              <br />
              Email: <a href="mailto:ceooffice@iffcosez.in">ceooffice@iffcosez.in</a>
              <br />
              Phone: <a href="tel:+919652993599">+91-9652993599</a>
            </address>
          </article>
        </div>
      </section>
    </>
  );
}