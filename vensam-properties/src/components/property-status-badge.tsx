import type { PropertyStatus } from "@/lib/api-types";

const TONES: Record<PropertyStatus, string> = {
  "For Sale": "bg-ink text-white",
  "For Rent": "bg-signal text-white",
};

/** Status chip — top-left corner of every property image. Sold properties are labeled in red. */
export default function PropertyStatusBadge({
  status,
  sold = false,
  className = "",
}: {
  status: PropertyStatus;
  sold?: boolean;
  className?: string;
}) {
  const label = sold ? "Sold" : status;
  const tone = sold ? "bg-red-600 text-white" : TONES[status] ?? "bg-ink text-white";
  return (
    <span
      className={`pointer-events-none z-10 rounded-pill px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] shadow-[0_1px_10px_rgba(0,0,0,0.10)] ${tone} ${className}`}
    >
      {label}
    </span>
  );
}
