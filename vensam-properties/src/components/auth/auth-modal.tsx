"use client";

import { useEffect, useState, type FormEvent } from "react";
import Img from "@/components/img";
import { useAuth, type AuthMode } from "./auth-context";

const EXTERIOR = "/media/p1.jpg";
const INTERIOR = "/media/p6.jpg";

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, signUp, signIn, configured } = useAuth();
  if (!authOpen) return null;
  return (
    <AuthModalDialog
      key={authMode}
      initialMode={authMode}
      onClose={closeAuth}
      signUp={signUp}
      signIn={signIn}
      dbReady={configured}
    />
  );
}

function AuthModalDialog({
  initialMode,
  onClose,
  signUp,
  signIn,
  dbReady,
}: {
  initialMode: AuthMode;
  onClose: () => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  dbReady: boolean;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [signupEmail, setSignupEmail] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/55 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Account"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative h-[min(38rem,92vh)] w-full max-w-[56rem] overflow-hidden rounded-card bg-paper shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-30 rounded-full bg-white/90 p-2 text-ink transition-colors hover:bg-white"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        <div className="auth-track h-full" data-mode={mode}>
          {/* Slide 1 — sign up: image left, form right */}
          <section className="auth-slide grid h-full grid-rows-[8.5rem_minmax(0,1fr)] sm:grid-cols-2 sm:grid-rows-1">
            <ImagePanel
              src={EXTERIOR}
              alt="Cliffside estate above the Pacific at dusk"
              caption="Places that outlive us."
              priority
            />
            <FormPanel
              mode="signup"
              onSwitch={() => setMode("signin")}
              onSignedUp={(email) => {
                setSignupEmail(email);
                setNotice("Account created — welcome. Sign in to continue.");
                setMode("signin");
              }}
              signUp={signUp}
              signIn={signIn}
              dbReady={dbReady}
            />
          </section>

          {/* Slide 2 — sign in: form left, image right (interior) */}
          <section className="auth-slide grid h-full grid-rows-[minmax(0,1fr)_8.5rem] sm:grid-cols-2 sm:grid-rows-1">
            <FormPanel
              key={signupEmail || "signin"}
              mode="signin"
              onSwitch={() => setMode("signup")}
              noticeText={notice}
              initialEmail={signupEmail}
              signUp={signUp}
              signIn={signIn}
              dbReady={dbReady}
            />
            <ImagePanel
              src={INTERIOR}
              alt="Double-height living room of a private residence"
              caption="Private Real Estate Advisory."
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function ImagePanel({
  src,
  alt,
  caption,
  priority,
}: {
  src: string;
  alt: string;
  caption: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-ink">
      <Img
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 28rem"
        priority={priority}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/60">Vensam Properties</p>
        <p className="mt-2 max-w-[18ch] text-[1.15rem] font-medium leading-snug tracking-[-0.02em] text-white">
          {caption}
        </p>
      </div>
    </div>
  );
}

function FormPanel({
  mode,
  onSwitch,
  onSignedUp,
  noticeText,
  initialEmail,
  signUp,
  signIn,
  dbReady,
}: {
  mode: AuthMode;
  onSwitch: () => void;
  onSignedUp?: (email: string) => void;
  noticeText?: string;
  initialEmail?: string;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  dbReady: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !dbReady) return;
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Please enter your name.");
        if (password.length < 6) throw new Error("Password needs at least 6 characters.");
        await signUp(name, email, password);
        setPassword("");
        onSignedUp?.(email);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-card border border-rule bg-mist px-4 py-3.5 text-[0.95rem] text-ink placeholder:text-fog transition-colors duration-200 focus:border-ink focus:bg-paper focus:outline-none";

  return (
    <div className="h-full min-h-0 overflow-y-auto px-7 py-9 sm:px-10 sm:py-11">
      <div className="flex min-h-full flex-col justify-center">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-brass">
        {mode === "signup" ? "Your shortlist" : "Welcome back"}
      </p>
      <h2 className="mt-4 text-[1.7rem] font-semibold leading-[1.12] tracking-[-0.028em]">
        {mode === "signup" ? "Create your account" : "Sign in to Vensam Properties"}
      </h2>
      <p className="mt-3 max-w-[30ch] text-[0.88rem] leading-relaxed text-slate">
        {mode === "signup"
          ? "Save residences you love, keep a private shortlist, and return to it on any device."
          : "Reach your saved residences and pick up the conversation where you left it."}
      </p>

      {!dbReady && (
        <p className="mt-6 rounded-card border border-amber-500/40 bg-amber-50 px-4 py-3 text-[0.8rem] leading-relaxed text-amber-900">
          Accounts open once the database is connected. Nothing is ever stored in this browser.
        </p>
      )}

      <form onSubmit={submit} className="mt-7 space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="auth-name" className="text-[0.8rem] font-medium text-ink">
              Full name
            </label>
            <input
              id="auth-name"
              type="text"
              required
              autoComplete="name"
              disabled={!dbReady}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${field} mt-2`}
              placeholder="Your name"
            />
          </div>
        )}
        <div>
          <label htmlFor="auth-email" className="text-[0.8rem] font-medium text-ink">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            disabled={!dbReady}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${field} mt-2`}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="text-[0.8rem] font-medium text-ink">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            disabled={!dbReady}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${field} mt-2`}
            placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
          />
        </div>

        {noticeText && mode === "signin" && (
          <p className="rounded-card border border-emerald-600/25 bg-emerald-600/5 px-4 py-3 text-[0.8rem] leading-relaxed text-emerald-800">
            {noticeText}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[0.8rem] leading-relaxed text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy || !dbReady} className="btn btn-solid w-full disabled:opacity-55">
          {busy ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 border-t border-rule pt-5">
        <button
          type="button"
          onClick={() => {
            setError("");
            onSwitch();
          }}
          className="text-[0.85rem] text-slate underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New to Vensam Properties? Create an account"}
        </button>
        <p className="mt-4 text-[0.7rem] leading-relaxed text-fog">
          By continuing you agree to our Terms and Privacy Notice. Nothing is added to a mailing list.
        </p>
      </div>
      </div>
    </div>
  );
}
