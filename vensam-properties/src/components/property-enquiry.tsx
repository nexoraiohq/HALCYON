"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError, OfflineError, api, apiConfigured } from "@/lib/api";
import type { EnquiryInput } from "@/lib/api-types";

/**
 * Enquiry form for one property. The submission is associated with the
 * property via the interest line (title + listing reference) and validated
 * before it goes through the existing enquiries backend.
 */
export default function PropertyEnquiry({
  propertyTitle,
  refId,
}: {
  propertyTitle: string;
  refId: string;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onPrefill = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string") setMessage(detail);
    };
    window.addEventListener("vensam:viewing", onPrefill);
    return () => window.removeEventListener("vensam:viewing", onPrefill);
  }, []);

  const field =
    "w-full rounded-card border border-rule bg-mist px-4 py-3.5 text-[0.95rem] text-ink placeholder:text-fog transition-colors duration-300 focus:border-ink focus:bg-paper focus:outline-none";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (digits.length < 7) {
      setError("Please enter a valid phone number (at least 7 digits).");
      return;
    }
    if (!apiConfigured) {
      setError("Enquiries require the database connection — please call or WhatsApp us instead.");
      return;
    }

    setError("");
    setSending(true);

    const input: EnquiryInput = {
      name: name.trim(),
      email: "",
      phone: phone.trim(),
      guide: "",
      interest: `Property enquiry: ${propertyTitle} (Ref ${refId})`,
      message: message.trim(),
    };

    try {
      await api.sendEnquiry(input);
    } catch (err) {
      if (err instanceof OfflineError) {
        setError("The enquiry could not be sent — the backend is unreachable. Please try again shortly.");
      } else if (err instanceof ApiError) {
        setError(err.message || "The enquiry could not be sent. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSending(false);
      return;
    }

    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" aria-live="polite" className="space-y-4">
        <p className="eyebrow text-brass">Enquiry received</p>
        <p className="text-[1.05rem] leading-relaxed text-ink">
          Thank you — your enquiry about <span className="font-medium">{propertyTitle}</span> has
          been received. A named advisor will reply within one business day.
        </p>
        <p className="text-[0.85rem] leading-relaxed text-slate">
          Reference {refId} · nothing you have sent is added to a mailing list.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <h3 className="text-[1rem] font-semibold tracking-[-0.012em]">Enquire about this property</h3>
        <p className="mt-1.5 text-[0.8rem] leading-snug text-slate">
          About {propertyTitle} — Ref {refId}
        </p>
      </div>

      <div>
        <label htmlFor="enquiry-name" className="text-[0.88rem] font-medium text-ink">
          Name <span className="text-red-600">*</span>
        </label>
        <input
          id="enquiry-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${field} mt-2.5`}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="enquiry-phone" className="text-[0.88rem] font-medium text-ink">
          Phone number <span className="text-red-600">*</span>
        </label>
        <input
          id="enquiry-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`${field} num mt-2.5`}
          placeholder="0722 000 000"
        />
      </div>

      <div>
        <label htmlFor="enquiry-message" className="text-[0.88rem] font-medium text-ink">
          Message <span className="font-normal text-fog">(optional)</span>
        </label>
        <textarea
          id="enquiry-message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${field} mt-2.5 resize-none`}
          placeholder="Anything you would like us to know before we call."
        />
      </div>

      {error && (
        <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <button type="submit" disabled={sending || !apiConfigured} className="btn btn-solid w-full disabled:opacity-55">
          {sending ? "Sending…" : "Send enquiry"}
        </button>
        <p className="text-[0.75rem] leading-relaxed text-fog">
          {apiConfigured
            ? "By sending, you agree we may contact you about this enquiry. Nothing else."
            : "Enquiries open once the database is connected — please call or WhatsApp us in the meantime."}
        </p>
      </div>
    </form>
  );
}
