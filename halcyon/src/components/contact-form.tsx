"use client";

import { useState } from "react";
import { ApiError, OfflineError, api, apiConfigured } from "@/lib/api";
import type { EnquiryInput } from "@/lib/api-types";

const INTEREST = ["Acquiring", "Selling", "Portfolio advice", "Restoration"];

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [interest, setInterest] = useState("Acquiring");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (sent) {
    return (
      <div className="border-t border-rule pt-10" role="status" aria-live="polite">
        <p className="eyebrow text-brass">Received</p>
        <h2 className="display mt-6 text-headline">
          Thank you — a named advisor will reply within one business day.
        </h2>
        <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-slate">
          Nothing you have sent is added to a mailing list, shared, or retained beyond
          the enquiry.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-card border border-rule bg-mist px-5 py-4 text-[1rem] text-ink placeholder:text-fog transition-colors duration-300 focus:border-ink focus:bg-paper focus:outline-none";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    if (!apiConfigured) {
      setError("Enquiries require the database connection — not available yet. Please email concierge@halcyon.estate.");
      return;
    }
    setError("");
    setSending(true);

    const fd = new FormData(e.currentTarget);
    const input: EnquiryInput = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      guide: String(fd.get("guide") ?? "").trim(),
      interest,
      message: String(fd.get("message") ?? "").trim(),
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

  return (
    <form onSubmit={submit} className="space-y-10">
      <fieldset>
        <legend className="text-[0.9rem] font-medium text-ink">I am interested in</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {INTEREST.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={interest === opt}
              onClick={() => setInterest(opt)}
              className={`rounded-pill border px-5 py-2.5 text-[0.9rem] tracking-[-0.008em] transition-colors duration-300 ${
                interest === opt
                  ? "border-ink bg-ink text-white"
                  : "border-rule bg-paper text-slate hover:border-ink hover:text-ink"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-[0.9rem] font-medium text-ink">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={`${field} mt-3`}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-[0.9rem] font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`${field} mt-3`}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-[0.9rem] font-medium text-ink">
            Telephone <span className="font-normal text-fog">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={`${field} num mt-3`}
            placeholder="+44 …"
          />
        </div>
        <div>
          <label htmlFor="guide" className="text-[0.9rem] font-medium text-ink">
            Guide budget
          </label>
          <select id="guide" name="guide" className={`${field} mt-3`} defaultValue="$5M — $15M">
            <option>Under $5M</option>
            <option>$5M — $15M</option>
            <option>$15M — $40M</option>
            <option>$40M+</option>
            <option>Prefer not to say</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-[0.9rem] font-medium text-ink">
          The brief
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${field} mt-3 resize-none`}
          placeholder="Where, roughly, and what you are trying to solve. Two sentences is plenty."
        />
      </div>

      {error && (
        <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-5 py-4 text-[0.9rem] text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-6 border-t border-rule pt-8">
        <button type="submit" disabled={sending || !apiConfigured} className="btn btn-solid disabled:opacity-55">
          {sending ? "Sending…" : "Send enquiry"}
        </button>
        <p className="max-w-xs text-[0.8rem] leading-relaxed text-fog">
          {!apiConfigured
            ? "Enquiries open once the database is connected — nothing is stored in your browser."
            : "By sending, you agree we may contact you about this enquiry. Nothing else."}
        </p>
      </div>
    </form>
  );
}
