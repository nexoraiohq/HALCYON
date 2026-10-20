"use client";

import Img from "@/components/img";
import Link from "next/link";
import { Chevron } from "@/components/ui";
import FavoriteButton from "@/components/favorite-button";
import PropertyStatusBadge from "@/components/property-status-badge";
import type { Property } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export { formatPrice };

export default function PropertyCard({
  property,
  index = 0,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  ratio = "aspect-[4/3]",
}: {
  property: Property;
  index?: number;
  sizes?: string;
  priority?: boolean;
  ratio?: string;
}) {
  return (
    <article className="reveal group relative" style={{ ["--reveal-delay" as string]: `${(index % 3) * 70}ms` }}>
      <div className={`frame ${ratio} w-full rounded-card`}>
        <Img
          src={property.image}
          alt={`${property.title} — ${property.location}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
        <PropertyStatusBadge status={property.status} sold={property.sold} className="absolute left-4 top-4" />
        <FavoriteButton slug={property.slug} className="absolute bottom-4 right-4" />
      </div>

      <Link
        href={`/properties/${property.slug}`}
        className="mt-5 block focus:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-paper after:absolute after:inset-0 after:content-['']"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <h3 className="text-[1.15rem] font-semibold tracking-[-0.018em] transition-opacity duration-300 group-hover:opacity-55">
              {property.title}
            </h3>
            <p className="mt-1 text-[0.9rem] leading-snug text-slate">
              {property.location} — {property.region}
            </p>
          </div>
          <p className="num shrink-0 text-[1.05rem] font-medium tracking-[-0.015em]">
            {formatPrice(property.price)}
            {property.status === "For Rent" && <span className="text-slate"> /mo</span>}
          </p>
        </div>

        <p className="mt-3 flex items-center gap-1 text-[0.9rem] text-signal">
          {property.beds} bed · {property.baths} bath · {property.area.toLocaleString()} sq ft
          <Chevron className="mt-px opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </p>
      </Link>
    </article>
  );
}
