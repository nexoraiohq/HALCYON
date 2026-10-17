import Link from "next/link";
import Img from "@/components/img";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
  size = "wide",
}: {
  children: ReactNode;
  className?: string;
  size?: "wide" | "text";
}) {
  const width = size === "text" ? "max-w-[44rem]" : "max-w-[73rem]";
  return (
    <div className={`mx-auto w-full ${width} px-6 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  index,
  className = "",
}: {
  children: ReactNode;
  index?: string;
  className?: string;
}) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${className}`}>
      {index && <span className="num opacity-45">{index}</span>}
      <span>{children}</span>
    </p>
  );
}

export function Section({
  children,
  className = "",
  id,
  tone = "paper",
  cv = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "paper" | "mist" | "ink";
  cv?: boolean;
}) {
  const tones = {
    paper: "bg-paper text-ink",
    mist: "bg-mist text-ink",
    ink: "bg-void text-white",
  };
  return (
    <section id={id} className={`${tones[tone]} ${cv ? "cv" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function SectionHead({
  eyebrow,
  index,
  title,
  intro,
  action,
  center = false,
  dark = false,
}: {
  eyebrow: string;
  index?: string;
  title: ReactNode;
  intro?: string;
  action?: ReactNode;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-[46rem] text-center" : ""}>
      <Eyebrow index={index} className={`reveal ${dark ? "text-white/45" : "text-fog"}`}>
        {eyebrow}
      </Eyebrow>
      <h2
        className={`reveal display mt-5 text-headline ${
          center ? "mt-5" : "mt-5 max-w-[22ch]"
        } ${dark ? "text-white" : ""}`}
        style={{ ["--reveal-delay" as string]: "60ms" }}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`reveal mt-6 text-[1.05rem] leading-relaxed tracking-[-0.01em] ${
            center ? "mx-auto max-w-[38rem]" : "max-w-[36rem]"
          } ${dark ? "text-white/60" : "text-slate"}`}
          style={{ ["--reveal-delay" as string]: "120ms" }}
        >
          {intro}
        </p>
      )}
      {action && (
        <div
          className={`reveal mt-9 ${center ? "flex justify-center" : ""}`}
          style={{ ["--reveal-delay" as string]: "180ms" }}
        >
          {action}
        </div>
      )}
    </div>
  );
}

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`size-3 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5.5 3l5 5-5 5" />
    </svg>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return <Chevron className={className} />;
}

export function TextLink({
  href,
  children,
  className = "",
  dark = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`link-chevron ${dark ? "on-dark" : ""} ${className}`}
    >
      {children}
      <Chevron />
    </Link>
  );
}

export function Figure({
  src,
  alt,
  className = "",
  sizes = "(max-width: 640px) 100vw, 50vw",
  priority = false,
  ratio = "aspect-[4/5]",
  caption,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  ratio?: string;
  caption?: string;
}) {
  return (
    <figure className={className}>
      <div className={`frame ${ratio} w-full rounded-card`}>
        <Img src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
      {caption && <figcaption className="mt-4 text-caption text-slate">{caption}</figcaption>}
    </figure>
  );
}
