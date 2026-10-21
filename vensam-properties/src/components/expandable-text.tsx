"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Long-form text that collapses to a comfortable reading height with a
 * "Show more" control; "Show less" folds it back. The control only appears
 * when the content actually overflows the collapsed height.
 */
export default function ExpandableText({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => {
      // While expanded the fold control must stay available, so only
      // re-measure while collapsed.
      if (open) return;
      setOverflowing(el.scrollHeight > el.clientHeight + 4);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  return (
    <div>
      <div className="relative">
        <div
          ref={contentRef}
          className={open ? undefined : "max-h-[15rem] overflow-hidden"}
        >
          {children}
        </div>
        {!open && overflowing && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper via-paper/80 to-transparent"
          />
        )}
      </div>

      {overflowing && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="mt-6 inline-flex items-center gap-2 rounded-pill border border-rule px-4 py-2 text-[0.8rem] font-medium tracking-[-0.004em] text-ink transition-colors duration-300 hover:border-ink"
        >
          {open ? "Show less" : "Show more"}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className={`size-3.5 text-slate transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
