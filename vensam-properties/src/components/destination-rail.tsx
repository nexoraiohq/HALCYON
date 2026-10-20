"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Img from "@/components/img";
import { Chevron } from "@/components/ui";

type Destination = { name: string; count: number; image: string; note: string };

export default function DestinationRail({ items }: { items: Destination[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("a");
    const step = card ? card.offsetWidth + 16 : Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const arrow =
    "flex size-10 items-center justify-center rounded-full border border-rule bg-white text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-35 sm:size-11";

  return (
    <div className="w-full">
      <div className="mt-10 mb-6 flex justify-end gap-2 pr-6 sm:pr-8 lg:pr-10">
        <button
          type="button"
          aria-label="Scroll destinations backward"
          onClick={() => nudge(-1)}
          disabled={atStart}
          className={arrow}
        >
          <Chevron className="size-4! rotate-180" />
        </button>
        <button
          type="button"
          aria-label="Scroll destinations forward"
          onClick={() => nudge(1)}
          disabled={atEnd}
          className={arrow}
        >
          <Chevron className="size-4!" />
        </button>
      </div>

      {/* overflow-y-hidden: overflow-x-auto alone promotes y to auto, which lets
          the rail rubber-band vertically on trackpads. */}
      <div
        ref={railRef}
        onScroll={update}
        className="no-bar flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-2 pl-6 sm:pl-8 lg:pl-10 scroll-pl-6 sm:scroll-pl-8 lg:scroll-pl-10"
      >
        {items.map((n, i) => (
          <Link
            key={n.name}
            href="/properties"
            className="reveal group w-[74vw] shrink-0 snap-start sm:w-[40vw] lg:w-[24rem]"
            style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
          >
            <div className="frame aspect-[3/4] w-full rounded-card">
              <Img
                src={n.image}
                alt={`${n.name}, ${n.note}`}
                fill
                sizes="(max-width: 640px) 74vw, (max-width: 1024px) 40vw, 384px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="eyebrow text-white/60">{n.note}</p>
                <h3 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.022em] text-white">
                  {n.name}
                </h3>
                <p className="num mt-1 text-[0.85rem] text-white/65">{n.count} residences</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
