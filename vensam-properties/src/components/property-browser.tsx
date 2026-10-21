"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Container } from "@/components/ui";
import PropertyCard from "@/components/property-card";
import { PROPERTY_STATUSES, type PropertyStatus } from "@/lib/api-types";
import type { Property } from "@/lib/data";

const SORTS = ["Featured", "Price · low to high", "Price · high to low"] as const;
type Sort = (typeof SORTS)[number];

/**
 * URL store for the filter bar.
 *
 * Filters live in the address bar (shareable, back/forward-friendly) but every
 * change is applied instantly in the browser: we subscribe to history
 * pushState/replaceState/popstate and read `location` directly, so filtering
 * never waits on a server roundtrip and the page itself stays fully static.
 */
type Listener = () => void;
const urlListeners = new Set<Listener>();
let historyPatched = false;

function ensureHistoryPatch(): void {
  if (historyPatched || typeof window === "undefined") return;
  historyPatched = true;
  const notify = () => urlListeners.forEach((l) => l());
  const push = window.history.pushState.bind(window.history);
  const replace = window.history.replaceState.bind(window.history);
  window.history.pushState = ((...args: Parameters<History["pushState"]>) => {
    push(...args);
    notify();
  }) as History["pushState"];
  window.history.replaceState = ((...args: Parameters<History["replaceState"]>) => {
    replace(...args);
    notify();
  }) as History["replaceState"];
  window.addEventListener("popstate", notify);
}

function subscribeUrl(onChange: Listener): () => void {
  ensureHistoryPatch();
  urlListeners.add(onChange);
  return () => {
    urlListeners.delete(onChange);
  };
}

const readUrl = (): string =>
  typeof window === "undefined" ? "" : window.location.pathname + window.location.search;

export default function PropertyBrowser({
  properties,
  children,
}: {
  properties: Property[];
  children?: React.ReactNode;
}) {
  const search = useSyncExternalStore(subscribeUrl, readUrl, () => "");
  const params = useMemo(() => new URLSearchParams(search.split("?")[1] ?? ""), [search]);
  const paramRegion = params.get("region");
  const paramStatus = params.get("status");

  const regions = useMemo(
    () => ["All regions", ...Array.from(new Set(properties.map((p) => p.region)))],
    [properties],
  );

  const region = paramRegion && regions.includes(paramRegion) ? paramRegion : regions[0];
  const status =
    paramStatus && PROPERTY_STATUSES.includes(paramStatus as PropertyStatus)
      ? (paramStatus as PropertyStatus)
      : null;

  const [sort, setSort] = useState<Sort>(SORTS[0]);
  const gridRef = useRef<HTMLUListElement>(null);
  const mounted = useRef(false);

  const list = useMemo(() => {
    let filtered = region === "All regions" ? properties : properties.filter((p) => p.region === region);
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (sort === "Price · low to high") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "Price · high to low") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [properties, region, status, sort]);

  // Cards mounted by a filter change arrive without `is-in`; animate them in.
  // First paint is left to RevealObserver so the initial stagger is preserved.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    gridRef.current
      ?.querySelectorAll<HTMLElement>(".reveal:not(.is-in)")
      .forEach((n) => n.classList.add("is-in"));
  }, [region, status, sort]);

  const setParam = (key: "region" | "status", value: string | null) => {
    const qs = new URLSearchParams(window.location.search);
    if (value === null) qs.delete(key);
    else qs.set(key, value);
    const next = qs.toString();
    const path = window.location.pathname;
    // replaceState keeps history clean (no entry per click) and notifies the
    // store above — the grid re-renders synchronously, no network involved.
    window.history.replaceState(window.history.state, "", next ? `${path}?${next}` : path);
  };

  const chipBase =
    "shrink-0 whitespace-nowrap rounded-pill border px-3.5 py-1.5 text-[0.78rem] font-medium tracking-[-0.004em] transition-colors duration-300";

  const availability: { key: string; value: string | null; label: string }[] = [
    { key: "all", value: null, label: "All" },
    ...PROPERTY_STATUSES.map((s) => ({ key: s, value: s as string | null, label: s })),
  ];

  return (
    <>
      {/* Filters — three labelled groups: availability, region, order.
          One compact sticky row from tablet up; stacked and static below so
          the bar never eats the viewport while reading cards. */}
      <div className="border-b border-rule/70 bg-white/80 backdrop-blur-xl md:sticky md:top-[52px] md:z-30">
        <Container>
          <div className="flex flex-col gap-3 py-3.5 md:flex-row md:items-center md:gap-6">
            <div
              role="group"
              aria-label="Filter by availability"
              className="flex w-full shrink-0 rounded-pill border border-rule bg-white p-1 md:inline-flex md:w-fit"
            >
              {availability.map((o) => {
                const on = status === o.value;
                return (
                  <button
                    key={o.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setParam("status", o.value)}
                    className={`flex-1 rounded-pill px-3.5 py-2 text-center text-[0.78rem] font-medium tracking-[-0.004em] transition-colors duration-300 md:flex-none ${
                      on ? "bg-ink text-white" : "text-slate hover:text-ink"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>

            {/* Small screens: region chips and sort share one full-width row
                (chips scroll, sort pinned right). From md up the wrapper
                dissolves (display:contents) into the single filter row. */}
            <div className="flex items-center gap-3 md:contents">
              <div
                role="group"
                aria-label="Filter by region"
                className="no-bar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto"
              >
                {regions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={region === r}
                    onClick={() => setParam("region", r === "All regions" ? null : r)}
                    className={`${chipBase} ${
                      region === r
                        ? "border-ink bg-ink text-white"
                        : "border-rule text-slate hover:border-ink hover:text-ink"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <label className="flex shrink-0 items-center gap-2.5">
                <span className="text-[0.78rem] tracking-[-0.004em] text-slate">Sort</span>
                <span className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    aria-label="Sort residences"
                    className="cursor-pointer appearance-none rounded-pill border border-rule bg-white py-2 pl-3.5 pr-8 text-[0.78rem] font-medium tracking-[-0.004em] text-ink transition-colors duration-300 hover:border-ink focus:border-ink focus:outline-none"
                  >
                    {SORTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </label>
            </div>
          </div>
        </Container>
      </div>

      <section className="bg-paper py-16 sm:py-20 lg:py-24">
        <Container>
          <ul ref={gridRef} className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => (
              <li key={p.slug}>
                <PropertyCard
                  property={p}
                  index={i}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </li>
            ))}
          </ul>
          {list.length === 0 && (
            <p className="mt-10 rounded-card border border-dashed border-rule bg-mist px-6 py-10 text-center text-[0.95rem] text-slate">
              No residences match this filter — try another region or status.
            </p>
          )}
          {children}
        </Container>
      </section>
    </>
  );
}
