import Link from "next/link";
import type { Metadata } from "next";
import Img from "@/components/img";

export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-void px-6 pb-24 pt-32 text-center text-white">
      <Img
        src="/media/hero.jpg"
        alt=""
        fill
        sizes="100vw"
        className="scale-110 object-cover opacity-40 blur-2xl"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.8)_100%)]" />

      {/* Giant ghosted 404 behind everything */}
      <p
        aria-hidden="true"
        className="hero-in pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-[min(38vw,26rem)] font-semibold leading-none tracking-[-0.045em] text-white/[0.07]"
      >
        404
      </p>

      <div className="relative flex flex-col items-center">
        <p className="hero-in eyebrow text-white/45">Error 404</p>
        <h1
          className="hero-in mt-6 max-w-[16ch] text-display"
          style={{ ["--reveal-delay" as string]: "60ms" }}
        >
          This address has moved.
        </h1>
        <p
          className="hero-in mt-7 max-w-[44ch] text-[1.05rem] leading-relaxed tracking-[-0.01em] text-white/60"
          style={{ ["--reveal-delay" as string]: "140ms" }}
        >
          The page you were looking for is no longer here — or never was. The
          residences, however, very much are.
        </p>
        <div
          className="hero-in mt-10 flex flex-wrap justify-center gap-3"
          style={{ ["--reveal-delay" as string]: "220ms" }}
        >
          <Link href="/" className="btn btn-light">
            Return home
          </Link>
          <Link href="/properties" className="btn btn-ghost-light">
            Browse residences
          </Link>
        </div>
      </div>
    </section>
  );
}
