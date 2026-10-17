"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/ui";
import PropertyCard from "@/components/property-card";
import type { Property } from "@/lib/data";

const SORTS = ["Featured", "Price · low to high", "Price · high to low"] as const;
type Sort = (typeof SORTS)[number];

export default function PropertyBrowser({
  properties,
  initialRegion,
  children,
}: {
  properties: Property[];
  initialRegion?: string;
  children?: React.ReactNode;
}) {
  const regions = useMemo(
    () => ["All regions", ...Array.from(new Set(properties.map((p) => p.region)))],
    [properties],
  );
  const [region, setRegion] = useState(() =>
    initialRegion && regions.includes(initialRegion) ? initialRegion : regions[0],
  );
  const [sort, setSort] = useState<Sort>(SORTS[0]);
  const gridRef = useRef<HTMLUListElement>(null);
  const mounted = useRef(false);

  const list = useMemo(() => {
    const filtered =
      region === "All regions" ? properties : properties.filter((p) => p.region === region);
    if (sort === "Price · low to high") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "Price · high to low") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [properties, region, sort]);

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
  }, [region, sort]);

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
                onClick={() => setRegion(r)}
                className={`${tabBase} ${
                  region === r
                    ? "border-b-ink text-ink"
                    : "border-b-transparent text-slate hover:text-ink"
                } ${i === 0 ? "pl-0" : ""}`}
              >
                {r}
              </button>
            ))}
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
          {children}
        </Container>
      </section>
    </>
  );
}
