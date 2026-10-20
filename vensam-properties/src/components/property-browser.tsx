"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Container } from "@/components/ui";
import PropertyCard from "@/components/property-card";
import { PROPERTY_STATUSES, type PropertyStatus } from "@/lib/api-types";
import type { Property } from "@/lib/data";

const SORTS = ["Featured", "Price · low to high", "Price · high to low"] as const;
type Sort = (typeof SORTS)[number];

export default function PropertyBrowser({
  properties,
  initialRegion = null,
  initialStatus = null,
  children,
}: {
  properties: Property[];
  initialRegion?: string | null;
  initialStatus?: string | null;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const regions = useMemo(
    () => ["All regions", ...Array.from(new Set(properties.map((p) => p.region)))],
    [properties],
  );

  const region =
    initialRegion && regions.includes(initialRegion) ? initialRegion : regions[0];
  const status =
    initialStatus && PROPERTY_STATUSES.includes(initialStatus as PropertyStatus)
      ? (initialStatus as PropertyStatus)
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

  // Filters live in the URL (shareable, back/forward-friendly). The next URL is
  // built from the current one so region, status and any other params coexist.
  const setParam = (key: "region" | "status", value: string | null) => {
    const qs = new URLSearchParams(window.location.search);
    if (value === null) qs.delete(key);
    else qs.set(key, value);
    const next = qs.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const tabBase =
    "shrink-0 border-b-2 px-4 py-4 text-[0.82rem] tracking-[-0.006em] transition-colors duration-300";

  return (
    <>
      <div className="sticky top-[52px] z-30 border-b border-rule/70 bg-white/80 backdrop-blur-xl backdrop-saturate-180">
        <Container>
          <div className="no-bar flex items-stretch overflow-x-auto">
            {regions.map((r, i) => (
              <button
                key={r}
                type="button"
                aria-pressed={region === r}
                onClick={() => setParam("region", r === "All regions" ? null : r)}
                className={`${tabBase} ${
                  region === r
                    ? "border-b-ink text-ink"
                    : "border-b-transparent text-slate hover:text-ink"
                } ${i === 0 ? "pl-0" : ""}`}
              >
                {r}
              </button>
            ))}

            <span className="flex shrink-0 items-center gap-2 self-center pl-3 pr-1">
              {PROPERTY_STATUSES.map((s) => {
                const on = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    aria-label={
                      on ? `Clear filter — show all residences` : `Show only residences for ${s === "For Sale" ? "sale" : "rent"}`
                    }
                    onClick={() => setParam("status", on ? null : s)}
                    className={`shrink-0 rounded-pill border px-3.5 py-1.5 text-[0.78rem] tracking-[-0.004em] transition-colors duration-300 ${
                      on
                        ? "border-ink bg-ink text-white"
                        : "border-rule text-slate hover:border-ink hover:text-ink"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </span>

            <span className="ml-auto flex shrink-0 items-stretch">
              {SORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={sort === s}
                  onClick={() => setSort(s)}
                  className={`${tabBase} ${
                    sort === s
                      ? "border-b-ink text-ink"
                      : "border-b-transparent text-slate hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </span>
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
