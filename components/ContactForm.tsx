"use client";

import { FormEvent } from "react";
import { useState } from "react";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const v = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement).value.trim();
    const apiKey = process.env.NEXT_PUBLIC_IKSEZ_PUBLISHABLE_KEY;

    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey ?? "" },
        body: JSON.stringify({
          first_name: v("name"),
          email: v("email"),
          lead_source: "Website contact form",
          description: v("message"),
          data: { subject: v("subject") },
        }),
      });
      const result = (await response.json()) as { is_success?: boolean; message?: string };

      if (!response.ok || result.is_success === false) {
        throw new Error(result.message || "We could not send your message. Please try again.");
      }

      form.reset();
      setFeedback({ type: "success", message: "Thank you. Your message has been sent successfully." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "We could not send your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <button className="btn btn--brand btn--lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send message"}
        </button>
      </div>
      {feedback && (
        <p
          className={feedback.type === "success" ? "form-feedback form-feedback--success" : "form-feedback form-feedback--error"}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
