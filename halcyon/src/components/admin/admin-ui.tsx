"use client";

import { useEffect, type ReactNode } from "react";

export const inputCls =
  "w-full rounded-card border border-rule bg-paper px-4 py-3 text-[0.92rem] text-ink placeholder:text-fog transition-colors duration-200 focus:border-ink focus:outline-none";

export const compactInputCls =
  "rounded-pill border border-rule bg-paper px-3 py-1.5 text-[0.82rem] text-ink placeholder:text-fog transition-colors duration-200 focus:border-ink focus:outline-none";

export function Field({
  label,
  hint,
  required,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[0.82rem] font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-brass">*</span>}
        {hint && <span className="ml-2 font-normal text-fog">{hint}</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "blue" | "brass" | "green" | "red" | "amber"; children: ReactNode }) {
  const tones: Record<string, string> = {
    neutral: "bg-mist text-slate",
    blue: "bg-signal/10 text-signal",
    brass: "bg-brass/12 text-brass",
    green: "bg-emerald-600/10 text-emerald-700",
    red: "bg-red-600/10 text-red-700",
    amber: "bg-amber-500/12 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[0.72rem] font-medium tracking-[0.01em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatusDot({ tone }: { tone: "green" | "amber" | "red" | "fog" }) {
  const colors: Record<string, string> = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    fog: "bg-fog",
  };
  return <span className={`inline-block size-2 rounded-full ${colors[tone]}`} aria-hidden />;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card p-10 text-center sm:p-14">
      <p className="display text-title">{title}</p>
      <p className="mx-auto mt-4 max-w-[34rem] text-[0.92rem] leading-relaxed text-slate">{body}</p>
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-[1.25rem] bg-paper shadow-2xl sm:rounded-[1.25rem] ${wide ? "sm:max-w-[46rem]" : "sm:max-w-[34rem]"}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-rule px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-[1.15rem] font-semibold tracking-[-0.018em]">{title}</h2>
            {subtitle && <p className="mt-1 text-[0.82rem] text-slate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 rounded-full p-2 text-slate transition-colors hover:bg-mist hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-[0.92rem] leading-relaxed text-slate">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={onConfirm} className="btn bg-red-700 text-white hover:bg-red-800">
          {confirmLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-quiet">
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export function Banner({
  tone = "info",
  children,
  action,
}: {
  tone?: "info" | "warn" | "error";
  children: ReactNode;
  action?: ReactNode;
}) {
  const tones: Record<string, string> = {
    info: "border-signal/25 bg-signal/5 text-ink",
    warn: "border-amber-500/35 bg-amber-50 text-ink",
    error: "border-red-300 bg-red-50 text-red-800",
  };
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-card border px-5 py-4 text-[0.85rem] leading-relaxed ${tones[tone]}`}>
      <div>{children}</div>
      {action}
    </div>
  );
}

export function IconBtn({
  label,
  onClick,
  children,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded-full p-2 transition-colors ${
        tone === "danger"
          ? "text-slate hover:bg-red-50 hover:text-red-700"
          : "text-slate hover:bg-mist hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export const icons = {
  plus: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  pencil: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M11.3 2.7a1.5 1.5 0 012.1 2.1L5.5 12.7l-3 1 1-3 7.8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  trash: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 4h11M6 4V2.8h4V4M5 4l.6 9.2h4.8L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sync: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M13.5 8a5.5 5.5 0 01-9.7 3.5M2.5 8a5.5 5.5 0 019.7-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.5 1.8v2.8h-2.8M3.5 14.2v-2.8h2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  star: (filled: boolean) => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"} aria-hidden>
      <path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.2L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  ),
  upload: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 10.5V2.5M8 2.5L5 5.5M8 2.5l3 3M2.5 10v2.5a1 1 0 001 1h9a1 1 0 001-1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function Thumb({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  if (!src) {
    return <div className={`rounded-[0.6rem] bg-mist ${className}`} aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin previews render backend-managed URLs directly
    <img
      src={src}
      alt={alt}
      className={`rounded-[0.6rem] object-cover ${className}`}
      loading="lazy"
    />
  );
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function timeAgo(ts: number | string): string {
  const t = typeof ts === "number" ? ts : Date.parse(ts);
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return `${d} d ago`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
