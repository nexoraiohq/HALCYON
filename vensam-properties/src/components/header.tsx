"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { Chevron } from "@/components/ui";

const PROPERTIES = [
  {
    href: "/properties",
    label: "Buy a property",
    caption: "Residences currently offered",
  },
  {
    href: "/properties",
    label: "Rent a property",
    caption: "Homes available to lease",
  },
  {
    href: "/contact",
    label: "Let Your Property",
    caption: "List with Vensam Properties",
  },
];

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About us" },
  { href: "/agents", label: "People" },
  { href: "/journal", label: "Journal" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const pathname = usePathname();

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setPropsOpen(false);
  }

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
              aria-label="Vensam Property Kenya — home"
              className="transition-opacity duration-300 hover:opacity-55"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/vensam-logo.svg"
                alt=""
                width={207}
                height={28}
                className="h-[28px] w-auto"
                decoding="async"
              />
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
              <PropertiesMenu pathname={pathname} />
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
                className="hidden rounded-pill bg-navy px-4 py-[0.42rem] text-[0.82rem] text-white transition-opacity duration-300 hover:opacity-80 sm:inline-block"
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
        <div className="flex h-full flex-col overflow-y-auto bg-white pt-[52px]">
          <nav aria-label="Mobile" className="flex flex-col px-6 pt-4">
            <div className="border-b border-rule/60">
              <button
                type="button"
                onClick={() => setPropsOpen((v) => !v)}
                aria-expanded={propsOpen}
                aria-controls="mobile-properties"
                className="group flex w-full items-center justify-between py-5 text-left"
              >
                <span className="text-[1.6rem] font-semibold tracking-[-0.025em] transition-opacity duration-300 group-hover:opacity-55">
                  Properties
                </span>
                <span className="flex items-center gap-3">
                  <span className="num text-[0.8rem] text-fog">01</span>
                  <Chevron
                    className={`text-fog transition-transform duration-300 ${
                      propsOpen ? "-rotate-90" : "rotate-90"
                    }`}
                  />
                </span>
              </button>

              <div
                id="mobile-properties"
                className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${
                  propsOpen
                    ? "grid-rows-[1fr] visible"
                    : "grid-rows-[0fr] invisible"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="mb-5 ml-1 border-l border-rule pl-5">
                    {PROPERTIES.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="group block border-b border-rule/50 py-3.5 last:border-0"
                        >
                          <span className="flex items-center justify-between gap-4">
                            <span className="text-[1.05rem] font-medium tracking-[-0.015em] transition-opacity duration-300 group-hover:opacity-55">
                              {item.label}
                            </span>
                            <Chevron className="text-fog transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                          <span className="mt-0.5 block text-[0.78rem] text-fog">
                            {item.caption}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

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
                <span className="num text-[0.8rem] text-fog">0{i + 2}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-6 pb-10 pt-8">
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

function PropertiesMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = pathname.startsWith("/properties");

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="properties-menu"
        className={`flex items-center gap-1.5 text-[0.82rem] tracking-[-0.006em] transition-opacity duration-300 hover:opacity-55 ${
          active || open ? "opacity-100" : "opacity-70"
        }`}
      >
        Properties
        <Chevron
          className={`text-fog transition-transform duration-300 ${
            open ? "-rotate-90" : "rotate-90"
          }`}
        />
      </button>

      {open && (
        <div
          id="properties-menu"
          className="menu-in absolute left-0 top-full z-50 mt-3 w-[21.5rem] rounded-menu border border-white/12 bg-navy/95 p-2 shadow-[0_24px_60px_rgba(16,37,66,0.28),0_2px_10px_rgba(16,37,66,0.14)] backdrop-blur-xl backdrop-saturate-150"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -top-[5px] left-7 size-2.5 rotate-45 rounded-[2px] border-l border-t border-white/12 bg-navy/95 backdrop-blur-xl"
          />
          {PROPERTIES.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="group flex items-start justify-between gap-4 rounded-[0.6rem] px-3.5 py-3 transition-colors duration-200 hover:bg-white/12 focus-visible:bg-white/12"
            >
              <span>
                <span className="block text-[0.88rem] tracking-[-0.008em] text-white transition-opacity duration-200 group-hover:opacity-80">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[0.76rem] leading-snug text-white/55">
                  {item.caption}
                </span>
              </span>
              <Chevron className="mt-1 text-white/45 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      )}
    </div>
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
