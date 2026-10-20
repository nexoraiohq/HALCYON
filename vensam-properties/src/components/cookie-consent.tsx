"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "vensamproperties-consent";

type Consent = { necessary: true; analytics: boolean; preferences: boolean };

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors duration-300 ${
        checked ? "bg-ink" : "bg-fog/50"
      } ${disabled ? "cursor-default" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

const ROWS: { id: "necessary" | "analytics" | "preferences"; title: string; body: string }[] = [
  {
    id: "necessary",
    title: "Necessary",
    body: "Required for the site to function — security, navigation, and remembering this choice. Always on.",
  },
  {
    id: "analytics",
    title: "Analytics",
    body: "Anonymous, aggregated statistics about which residences are viewed. No advertising, no profiles.",
  },
  {
    id: "preferences",
    title: "Preferences",
    body: "Remembers optional choices you make on the site between visits.",
  },
];

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [view, setView] = useState<"banner" | "customize">("banner");
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* storage unavailable */
    }
    let timer: number | undefined;
    if (!stored) timer = window.setTimeout(() => setShow(true), 5000);

    const reopen = () => {
      window.clearTimeout(timer);
      setView("banner");
      setShow(true);
    };
    window.addEventListener("vensamproperties:consent-settings", reopen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("vensamproperties:consent-settings", reopen);
    };
  }, []);

  const save = (c: Consent) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...c, ts: Date.now(), v: 1 }));
    } catch {
      /* storage unavailable */
    }
    setShow(false);
  };

  if (!show) return null;

  const btn = "btn px-4 py-2.5 text-[0.85rem]";

  return (
    <div
      className="hero-in fixed bottom-4 left-4 right-4 z-[90] sm:right-auto sm:max-w-[28rem]"
      role="dialog"
      aria-label="Cookie preferences"
      aria-live="polite"
    >
      <div className="rounded-card border border-rule bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
        <p className="eyebrow text-fog">Cookies</p>

        {view === "banner" ? (
          <>
            <h2 className="mt-3 text-[1.15rem] font-semibold tracking-[-0.015em] text-ink">
              A note on cookies.
            </h2>
            <p className="mt-3 text-[0.88rem] leading-relaxed text-slate">
              We use a small number of cookies to run the site. Nothing is set until you
              choose — accept all, refuse all, or decide category by category.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={btn}
                onClick={() => save({ necessary: true, analytics: false, preferences: false })}
              >
                Deny all
              </button>
              <button type="button" className={btn} onClick={() => setView("customize")}>
                Customize
              </button>
              <button
                type="button"
                className={`${btn} btn-solid ml-auto`}
                onClick={() => save({ necessary: true, analytics: true, preferences: true })}
              >
                Accept all
              </button>
            </div>
            <Link
              href="/privacy"
              className="mt-4 inline-block text-[0.78rem] text-fog underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Read the privacy notice
            </Link>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-[1.15rem] font-semibold tracking-[-0.015em] text-ink">
              Customize
            </h2>
            <ul className="mt-4 space-y-2.5">
              {ROWS.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-4 rounded-card bg-mist p-4">
                  <div>
                    <p className="text-[0.88rem] font-semibold text-ink">{r.title}</p>
                    <p className="mt-1 text-[0.78rem] leading-relaxed text-slate">{r.body}</p>
                  </div>
                  <Toggle
                    label={r.title}
                    disabled={r.id === "necessary"}
                    checked={r.id === "necessary" ? true : r.id === "analytics" ? analytics : preferences}
                    onChange={r.id === "analytics" ? setAnalytics : setPreferences}
                  />
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button type="button" className={btn} onClick={() => setView("banner")}>
                Back
              </button>
              <button
                type="button"
                className={`${btn} btn-solid ml-auto`}
                onClick={() => save({ necessary: true, analytics, preferences })}
              >
                Save choices
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
