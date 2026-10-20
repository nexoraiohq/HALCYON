"use client";

import { AGENCY_PHONE } from "@/lib/data";

const waIcon = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);

const phoneIcon = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

function goToEnquiry(focusName: boolean) {
  const el = document.getElementById("enquiry");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (focusName) {
    window.setTimeout(() => document.getElementById("enquiry-name")?.focus(), 350);
  }
}

/**
 * Contact actions for one property. WhatsApp messages always carry the
 * property title and listing reference; the number is the agency's single line.
 * Variants: "rail" (desktop contact card) and "bar" (fixed mobile action bar).
 */
export default function PropertyActions({
  title,
  refId,
  url,
  variant,
}: {
  title: string;
  refId: string;
  url: string;
  variant: "rail" | "bar";
}) {
  const waHref = `https://wa.me/${AGENCY_PHONE.whatsapp}?text=${encodeURIComponent(
    `Hello Vensam Properties, I would like to know more about "${title}" (Ref ${refId}). ${url}`,
  )}`;

  const requestViewing = () => {
    window.dispatchEvent(
      new CustomEvent("vensam:viewing", {
        detail: `I would like to request a viewing of "${title}" (Ref ${refId}).`,
      }),
    );
    goToEnquiry(false);
  };

  if (variant === "bar") {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-rule bg-white/95 px-3 py-2.5 backdrop-blur-lg sm:hidden"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      >
        <a
          href={`tel:${AGENCY_PHONE.tel}`}
          className="flex items-center justify-center gap-1.5 rounded-pill border border-rule bg-paper px-2 py-2.5 text-[0.8rem] font-medium text-ink"
        >
          {phoneIcon}
          Call
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-pill border border-rule bg-paper px-2 py-2.5 text-[0.8rem] font-medium text-ink"
        >
          {waIcon}
          WhatsApp
        </a>
        <button
          type="button"
          onClick={() => goToEnquiry(true)}
          className="rounded-pill bg-ink px-2 py-2.5 text-[0.8rem] font-medium text-white"
        >
          Enquire
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <button type="button" onClick={() => goToEnquiry(true)} className="btn btn-solid w-full">
        Enquire about this property
      </button>
      <button type="button" onClick={requestViewing} className="btn btn-quiet w-full">
        Request a viewing
      </button>
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="btn btn-quiet flex items-center justify-center gap-2 px-3 text-[0.88rem]"
        >
          {waIcon}
          WhatsApp
        </a>
        <a
          href={`tel:${AGENCY_PHONE.tel}`}
          className="btn btn-quiet flex items-center justify-center gap-2 px-3 text-[0.88rem]"
        >
          {phoneIcon}
          Call {AGENCY_PHONE.display}
        </a>
      </div>
    </div>
  );
}
