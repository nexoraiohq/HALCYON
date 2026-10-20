import type { PropertyStatus } from "@/lib/api-types";

const TONES: Record<PropertyStatus, string> = {
  "For Sale": "bg-ink text-white",
  "Private Listing": "bg-brass text-white",
  "Under Offer": "border border-black/10 bg-paper/92 text-ink backdrop-blur-md",
};

/** Status chip — top-left corner of every property image. */
export default function PropertyStatusBadge({
  status,
  className = "",
}: {
  status: PropertyStatus;
  className?: string;
}) {
  return (
    <span
      className={`pointer-events-none z-10 rounded-pill px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] shadow-[0_1px_10px_rgba(0,0,0,0.10)] ${TONES[status] ?? "bg-ink text-white"} ${className}`}
    >
      {status}
    </span>
  );
}
