"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";

const NAV = [
  { href: "/properties", label: "Residences" },
  { href: "/services", label: "Advisory" },
  { href: "/about", label: "The House" },
  { href: "/agents", label: "People" },
  { href: "/journal", label: "Journal" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50">
        <div className="border-b border-black/5 bg-white/72 backdrop-blur-xl backdrop-saturate-180">
          <div className="mx-auto flex h-[52px] w-full max-w-[73rem] items-center justify-between gap-8 px-6 sm:px-8 lg:px-10">
            <Link
              href="/"
              aria-label="Halcyon — home"
              className="text-[0.95rem] font-semibold tracking-[-0.01em] transition-opacity duration-300 hover:opacity-55"
            >
              HALCYON
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-[0.82rem] tracking-[-0.006em] transition-opacity duration-300 hover:opacity-55 ${
                      active ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-5">
              <AccountArea />
              <Link
                href="/contact"
                className="hidden rounded-pill bg-ink px-4 py-[0.42rem] text-[0.82rem] text-white transition-opacity duration-300 hover:opacity-80 sm:inline-block"
              >
                Private Enquiry
              </Link>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-[6px] md:hidden"
              >
                <span
                  className={`block h-px w-[18px] bg-ink transition-transform duration-300 ${
                    open ? "translate-y-[3.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-px w-[18px] bg-ink transition-transform duration-300 ${
                    open ? "-translate-y-[3.5px] -rotate-45" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div id="mobile-menu" hidden={!open} className="fixed inset-0 z-40 md:hidden">
        <div className="flex h-full flex-col bg-white pt-[52px]">
          <nav aria-label="Mobile" className="flex flex-col px-6 pt-4">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between border-b border-rule/60 py-5"
                onClick={() => setOpen(false)}
              >
                <span className="text-[1.6rem] font-semibold tracking-[-0.025em] transition-opacity duration-300 group-hover:opacity-55">
                  {item.label}
                </span>
                <span className="num text-[0.8rem] text-fog">0{i + 1}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-6 pb-10">
            <div className="mb-4">
              <AccountArea />
            </div>
            <Link
              href="/contact"
              className="btn btn-solid w-full"
              onClick={() => setOpen(false)}
            >
              Private Enquiry
            </Link>
            <p className="mt-6 text-center text-caption text-fog">
              London · New York · Los Angeles · Singapore
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function AccountArea() {
  const { user, favorites, openAuth, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openAuth("signin")}
        className="text-[0.82rem] tracking-[-0.006em] opacity-70 transition-opacity duration-300 hover:opacity-100"
      >
        Sign in
      </button>
    );
  }

  const initials =
    user.name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account"
        className="flex items-center gap-2"
      >
        <span className="grid size-8 place-items-center rounded-full bg-ink text-[0.68rem] font-semibold tracking-[0.02em] text-white">
          {initials}
        </span>
        <span className="hidden text-[0.82rem] tracking-[-0.006em] opacity-80 md:inline">
          {user.name.split(" ")[0]}
        </span>
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2.5 w-64 rounded-card border border-rule bg-paper p-5 shadow-xl">
            <p className="truncate text-[0.9rem] font-medium">{user.name}</p>
            <p className="mt-0.5 truncate text-[0.78rem] text-slate">{user.email}</p>
            <div className="mt-4 flex items-center justify-between border-t border-rule pt-4">
              <span className="num text-[0.78rem] text-fog">{favorites.length} saved</span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="text-[0.8rem] text-slate underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
