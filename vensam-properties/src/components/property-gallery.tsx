"use client";

import { useEffect, useRef, useState } from "react";
import Img from "@/components/img";
import PropertyStatusBadge from "@/components/property-status-badge";
import type { PropertyStatus } from "@/lib/api-types";

/**
 * Property gallery — large main image with a thumbnail strip, a photo counter
 * and a full-screen viewer (keyboard: ←/→/Esc, focus trapped inside the dialog).
 */
export default function PropertyGallery({
  images,
  title,
  location,
  status,
  sold = false,
}: {
  images: string[];
  title: string;
  location: string;
  status: PropertyStatus;
  sold?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const mainRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  const safeIdx = Math.min(idx, Math.max(total - 1, 0));
  const altFor = (i: number) => `${title} — ${location}, photo ${i + 1} of ${total}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        mainRef.current?.focus();
      } else if (e.key === "ArrowRight") {
        setIdx((i) => (i + 1) % total);
      } else if (e.key === "ArrowLeft") {
        setIdx((i) => (i - 1 + total) % total);
      } else if (e.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes);
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (active instanceof Node && !dialogRef.current?.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, total]);

  const close = () => {
    setOpen(false);
    mainRef.current?.focus();
  };

  if (total === 0) return null;

  const thumb = (src: string, i: number, cls: string) => (
    <button
      key={i}
      type="button"
      onClick={() => setIdx(i)}
      aria-label={`Show photo ${i + 1} of ${total}`}
      aria-current={i === safeIdx}
      className={`relative shrink-0 overflow-hidden rounded-card border-2 transition-colors ${cls} ${
        i === safeIdx ? "border-ink" : "border-transparent hover:border-rule"
      }`}
    >
      <Img src={src} alt="" fill sizes="120px" className="object-cover" />
    </button>
  );

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-12">
        <button
          ref={mainRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View full screen — ${altFor(safeIdx)}`}
          className="relative aspect-[3/2] w-full cursor-zoom-in overflow-hidden rounded-card sm:col-span-8"
        >
          <Img
            src={images[safeIdx]}
            alt={altFor(safeIdx)}
            fill
            sizes="(max-width: 640px) 100vw, 66vw"
            priority
            fetchPriority="high"
            className="object-cover"
          />
          <PropertyStatusBadge
            status={status}
            sold={sold}
            className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5"
          />
          <span className="num pointer-events-none absolute bottom-4 right-4 rounded-pill bg-black/55 px-3 py-1.5 text-[0.75rem] text-white backdrop-blur-sm">
            {safeIdx + 1} / {total}
          </span>
        </button>

        {total > 1 && (
          <div className="no-bar flex gap-3 overflow-x-auto sm:col-span-4 sm:min-h-0 sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-[3/2] w-28 shrink-0 sm:w-full">
                {thumb(src, i, "absolute inset-0 h-full w-full")}
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — photo gallery, ${total} images`}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="num text-[0.85rem] text-white/80" aria-live="polite">
              {safeIdx + 1} / {total}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="rounded-full border border-white/25 p-2.5 text-white transition-colors hover:bg-white/10"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-4 sm:px-16">
            <Img
              src={images[safeIdx]}
              alt={altFor(safeIdx)}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i - 1 + total) % total)}
                  aria-label="Previous image"
                  className="absolute left-2 z-10 rounded-full border border-white/25 bg-black/40 p-2.5 text-white transition-colors hover:bg-white/10 sm:left-5"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i + 1) % total)}
                  aria-label="Next image"
                  className="absolute right-2 z-10 rounded-full border border-white/25 bg-black/40 p-2.5 text-white transition-colors hover:bg-white/10 sm:right-5"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <p className="truncate px-4 pb-4 text-center text-[0.8rem] text-white/55 sm:px-6">
            {title} — {location}
          </p>
        </div>
      )}
    </>
  );
}
