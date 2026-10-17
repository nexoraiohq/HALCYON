"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";

/**
 * Save (heart) control — bottom-right of every property image. Guests who
 * tap it get the account modal; the pending save completes after sign-in.
 */
export default function FavoriteButton({
  slug,
  className = "",
  size = "md",
}: {
  slug: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { isFavorite, toggleFavorite } = useAuth();
  const active = isFavorite(slug);
  const [popping, setPopping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const dim = size === "sm" ? "size-9" : "size-10 sm:size-11";

  return (
    <button
      type="button"
      aria-label={active ? "Remove from saved residences" : "Save this residence"}
      aria-pressed={active}
      title={active ? "Saved" : "Save"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = toggleFavorite(slug);
        if (now) {
          setPopping(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setPopping(false), 600);
        }
      }}
      className={`z-10 grid ${dim} place-items-center rounded-full border border-white/45 bg-white/80 shadow-[0_2px_14px_rgba(0,0,0,0.14)] backdrop-blur-md transition-[transform,background-color,border-color] duration-300 hover:scale-105 active:scale-95 ${popping ? "heart-pop" : ""} ${className}`}
    >
      <svg
        width={size === "sm" ? "15" : "17"}
        height={size === "sm" ? "15" : "17"}
        viewBox="0 0 24 24"
        fill={active ? "#c8102e" : "none"}
        stroke={active ? "#c8102e" : "#1d1d1f"}
        strokeWidth="1.7"
        aria-hidden
        className="transition-[fill,stroke] duration-300"
      >
        <path
          d="M12 20.5s-7.5-4.6-9.6-9.2C1 8 2.7 4.9 5.9 4.3c2-.4 3.9.5 5 2.1 1.1-1.6 3-2.5 5-2.1 3.2.6 4.9 3.7 3.5 7-2.1 4.6-9.4 9.2-9.4 9.2z"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
