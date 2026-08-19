"use client";

import { FormEvent } from "react";

export default function ContactForm() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    if (form.getAttribute("action")) return;
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const v = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement).value.trim();
    const body = `Name: ${v("name")}\nEmail: ${v("email")}\n\n${v("message")}`;

    window.location.href =
      "mailto:ceooffice@iffcosez.in" +
      `?subject=${encodeURIComponent(v("subject"))}` +
      `&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="form-grid" id="contact-form" noValidate onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field">
          <label htmlFor="cf-name">Name</label>
          <input type="text" id="cf-name" name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="cf-email">Email</label>
          <input type="email" id="cf-email" name="email" autoComplete="email" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="cf-subject">Subject</label>
        <input type="text" id="cf-subject" name="subject" required />
      </div>
      <div className="field">
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" required></textarea>
      </div>
      <div>
        <button className="btn btn--brand btn--lg" type="submit">
          Send message
        </button>
      </div>
      <p className="muted" style={{ fontSize: "var(--fs-sm)" }} id="cf-note">
        This opens your email client addressed to ceooffice@iffcosez.in.
      </p>
    </form>
  );
}
