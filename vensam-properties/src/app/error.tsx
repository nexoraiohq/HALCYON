"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-void px-6 text-center text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.8)_100%)]" />
      <p
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-[min(38vw,26rem)] font-semibold leading-none tracking-[-0.045em] text-white/[0.07]"
      >
        500
      </p>
      <div className="relative flex flex-col items-center">
        <p className="eyebrow text-white/45">Server error</p>
        <h1 className="mt-6 max-w-[16ch] text-display">
          Something went wrong.
        </h1>
        <p className="mt-7 max-w-[44ch] text-[1.05rem] leading-relaxed tracking-[-0.01em] text-white/60">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-light">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost-light">
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
