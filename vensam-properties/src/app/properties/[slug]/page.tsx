import type { Metadata } from "next";
import Img from "@/components/img";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, TextLink } from "@/components/ui";
import PropertyCard from "@/components/property-card";
import FavoriteButton from "@/components/favorite-button";
import PropertyGallery from "@/components/property-gallery";
import PropertyActions from "@/components/property-actions";
import PropertyEnquiry from "@/components/property-enquiry";
import { AGENCY_PHONE } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { getAgents, getProperties } from "@/lib/server-api";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const list = await getProperties();
  return list.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const all = await getProperties();
  const p = all.find((x) => x.slug === slug);
  if (!p) return { title: "Residence not found" };
  return {
    title: `${p.title} — ${p.location}`,
    description: p.blurb,
    alternates: { canonical: `/properties/${p.slug}` },
    openGraph: {
      title: `${p.title} — ${p.location}`,
      description: p.blurb,
      images: [{ url: p.image, width: 1400, height: 933, alt: p.title }],
    },
  };
}

export default async function PropertyPage({ params }: Params) {
  const { slug } = await params;
  const all = await getProperties();
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();

  const agentList = await getAgents();
  const agent = p.agent ? agentList.find((a) => a.slug === p.agent) : undefined;
  const images = Array.from(new Set([p.image, ...(p.gallery ?? [])].filter(Boolean)));
  const refId = p.slug.toUpperCase();
  const url = `https://www.vensamproperties.estate/properties/${p.slug}`;
  const isRent = p.status === "For Rent";
  const availability = p.sold ? "Sold" : isRent ? "Available to let" : "Available for sale";
  const waHref = `https://wa.me/${AGENCY_PHONE.whatsapp}?text=${encodeURIComponent(
    `Hello Vensam Properties, I would like to know more about "${p.title}" (Ref ${refId}). ${url}`,
  )}`;

  const available = all.filter((x) => x.slug !== p.slug && !x.sold);
  const sameRegion = available.filter((x) => x.region === p.region);
  const others = [...sameRegion, ...available.filter((x) => x.region !== p.region)].slice(0, 3);

  const specs: { k: string; v: string }[] = [];
  if (p.beds > 0) specs.push({ k: "Bedrooms", v: String(p.beds) });
  if (p.baths > 0) specs.push({ k: "Bathrooms", v: String(p.baths) });
  if (p.area > 0) specs.push({ k: "Property size", v: `${p.area.toLocaleString()} sq ft` });
  if (p.lot) specs.push({ k: "Land size", v: p.lot });
  if (p.parking && p.parking > 0)
    specs.push({ k: "Parking", v: `${p.parking} ${p.parking === 1 ? "space" : "spaces"}` });

  const details: [string, string][] = [
    ["Property type", p.type],
    ...(p.furnishing ? ([["Furnishing", p.furnishing]] as [string, string][]) : []),
    ...(p.condition ? ([["Condition", p.condition]] as [string, string][]) : []),
    ...(p.floor ? ([["Floor", p.floor]] as [string, string][]) : []),
    ...(p.tenure ? ([["Tenure", p.tenure]] as [string, string][]) : []),
    ["Availability", availability],
    ...(isRent ? ([["Rental terms", `${formatPrice(p.price)} per month`]] as [string, string][]) : []),
    ...(p.year ? ([["Year built", String(p.year)]] as [string, string][]) : []),
    ...(p.lot ? ([["Land size", p.lot]] as [string, string][]) : []),
    ["Region", p.region],
    ["Reference", refId],
  ];
  const missingParticulars = !p.furnishing || !p.condition || !p.floor || !p.tenure;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: p.title,
    url,
    description: p.blurb,
    image: p.image,
    dateBuilt: p.year ? String(p.year) : undefined,
    floorSize: p.area > 0 ? { "@type": "QuantitativeValue", value: p.area, unitCode: "FTK" } : undefined,
    numberOfBedrooms: p.beds > 0 ? p.beds : undefined,
    numberOfBathroomsTotal: p.baths > 0 ? p.baths : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.location,
      addressRegion: p.region,
      addressCountry: "KE",
    },
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "KES",
      availability: p.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
    broker: {
      "@type": "RealEstateAgent",
      name: "Vensam Properties",
      url: "https://www.vensamproperties.estate",
      telephone: `+${AGENCY_PHONE.tel.replace("+", "")}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Breadcrumb + gallery ─────────────────────────────────── */}
      <section className="bg-paper pt-24 sm:pt-28">
        <Container>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 py-5 text-[0.82rem] text-slate">
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span aria-hidden className="text-fog">
              /
            </span>
            <Link href="/properties" className="transition-colors hover:text-ink">
              Residences
            </Link>
            <span aria-hidden className="text-fog">
              /
            </span>
            <span aria-current="page" className="truncate text-ink">
              {p.title}
            </span>
          </nav>

          <PropertyGallery
            images={images}
            title={p.title}
            location={p.location}
            status={p.status}
            sold={p.sold}
          />
        </Container>
      </section>

      {/* ── Main content + contact rail ──────────────────────────── */}
      <section className="bg-paper py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              {/* Summary */}
              <p className="reveal eyebrow text-brass">
                {p.type} ·{" "}
                {p.sold ? <span className="text-red-600">Sold</span> : p.status}
              </p>
              <h1 className="reveal display mt-4 text-display" style={{ ["--reveal-delay" as string]: "70ms" }}>
                {p.title}
              </h1>
              <p className="reveal mt-3 text-[1.05rem] text-slate" style={{ ["--reveal-delay" as string]: "120ms" }}>
                {p.location} · {p.region}
              </p>

              <div className="mt-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-rule pb-7">
                <div>
                  <p className="text-[0.82rem] text-slate">{isRent ? "Rent" : "Guide price"}</p>
                  <p className="num mt-1.5 text-[clamp(1.9rem,4vw,2.5rem)] font-semibold leading-none tracking-[-0.03em]">
                    {formatPrice(p.price)}
                    {isRent && <span className="text-[0.95rem] font-medium tracking-[-0.01em] text-slate"> / month</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.82rem] text-slate">Reference</p>
                  <p className="num mt-1.5 text-[0.95rem] font-medium">{refId}</p>
                </div>
              </div>

              <p
                className={`mt-4 flex items-center gap-2 text-[0.9rem] font-medium ${
                  p.sold ? "text-red-600" : "text-signal"
                }`}
              >
                <span aria-hidden className="size-1.5 rounded-full bg-current" />
                {availability}
              </p>

              {/* Key specifications */}
              <div className="reveal mt-12" style={{ ["--reveal-delay" as string]: "170ms" }}>
                <Eyebrow>Key specifications</Eyebrow>
                {specs.length > 0 ? (
                  <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-rule sm:grid-cols-3">
                    {specs.map((s) => (
                      <div key={s.k} className="bg-mist px-5 py-5">
                        <dt className="text-[0.8rem] text-slate">{s.k}</dt>
                        <dd className="num mt-2.5 text-[1.15rem] font-semibold tracking-[-0.02em]">{s.v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-6 rounded-card border border-dashed border-rule bg-mist px-5 py-6 text-[0.9rem] text-slate">
                    Specifications are shared with the full particulars — enquire below or call{" "}
                    <span className="num">{AGENCY_PHONE.display}</span>.
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="reveal mt-12 space-y-5" style={{ ["--reveal-delay" as string]: "220ms" }}>
                <p className="text-[1.15rem] leading-relaxed tracking-[-0.012em] text-ink">{p.blurb}</p>
                {p.description.map((para) => (
                  <p key={para.slice(0, 24)} className="text-[1rem] leading-relaxed text-slate">
                    {para}
                  </p>
                ))}
              </div>

              {/* Features & amenities */}
              {p.features.length > 0 && (
                <div className="reveal mt-14" style={{ ["--reveal-delay" as string]: "260ms" }}>
                  <Eyebrow className="text-brass">Features &amp; amenities</Eyebrow>
                  <ul className="mt-6 grid gap-px overflow-hidden rounded-card bg-rule sm:grid-cols-2">
                    {p.features.map((f) => (
                      <li key={f} className="bg-mist px-5 py-4 text-[0.9rem] text-slate">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Property details */}
              <div className="reveal mt-14">
                <Eyebrow className="text-brass">Property details</Eyebrow>
                <dl className="mt-6 grid gap-px overflow-hidden rounded-card bg-rule sm:grid-cols-2">
                  {details
                    .filter(([, v]) => Boolean(v))
                    .map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4 bg-mist px-5 py-4 text-[0.88rem]">
                      <dt className="text-slate">{k}</dt>
                      <dd className={`num text-right text-ink ${k === "Availability" && p.sold ? "text-red-600" : ""}`}>
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
                {missingParticulars && (
                  <p className="mt-4 text-[0.82rem] leading-relaxed text-fog">
                    Furnishing, floor, condition and tenure are shown where provided — the full
                    particulars are shared on request.
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="reveal mt-14">
                <Eyebrow className="text-brass">Location</Eyebrow>
                <p className="mt-5 text-[1.05rem] text-ink">
                  {p.location}
                  {p.region && ` · ${p.region}`}
                </p>
                <p className="mt-4 rounded-card border border-dashed border-rule bg-mist px-5 py-5 text-[0.9rem] leading-relaxed text-slate">
                  A map with the exact pin — and any nearby landmarks we can verify — is provided
                  when your viewing is arranged. Nothing on this page is estimated.
                </p>
              </div>

              {/* Agent & agency */}
              <div className="reveal mt-14">
                <Eyebrow className="text-brass">Agent &amp; contact</Eyebrow>
                {agent ? (
                  <div className="mt-6 flex items-center gap-4">
                    <div className="frame relative size-14 shrink-0 rounded-full">
                      <Img src={agent.image} alt={agent.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[1rem] font-medium">{agent.name}</p>
                      <p className="mt-0.5 truncate text-[0.85rem] text-slate">{agent.role}</p>
                      {agent.email && (
                        <a
                          href={`mailto:${agent.email}`}
                          className="mt-1 block truncate text-[0.85rem] text-signal transition-opacity hover:opacity-70"
                        >
                          {agent.email}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-[0.92rem] leading-relaxed text-slate">
                    Enquiries are handled by the Vensam Properties desk.
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-card border border-rule bg-mist px-5 py-4 text-[0.9rem]">
                  <span className="font-medium text-ink">Vensam Properties</span>
                  <a href={`tel:${AGENCY_PHONE.tel}`} className="num text-signal transition-opacity hover:opacity-70">
                    {AGENCY_PHONE.display}
                  </a>
                  <a href={waHref} target="_blank" rel="noreferrer" className="text-signal transition-opacity hover:opacity-70">
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Contact / enquiry rail */}
            <aside className="lg:col-span-5" aria-label="Contact and enquiry">
              <div className="space-y-6">
                <div className="card lg:sticky lg:top-24 lg:p-7">
                  <div className="flex items-end justify-between gap-4 border-b border-rule pb-5">
                    <div>
                      <p className={`eyebrow ${p.sold ? "text-red-600" : "text-brass"}`}>
                        {p.sold ? "Sold" : p.status}
                      </p>
                      <p className="num mt-2 text-[1.6rem] font-semibold leading-none tracking-[-0.03em]">
                        {formatPrice(p.price)}
                        {isRent && <span className="text-[0.85rem] font-medium text-slate"> /mo</span>}
                      </p>
                    </div>
                    <p className="num pb-1 text-right text-[0.78rem] text-slate">
                      Ref
                      <br />
                      {refId}
                    </p>
                  </div>

                  {agent && (
                    <div className="flex items-center gap-3 border-b border-rule py-4">
                      <div className="frame relative size-10 shrink-0 rounded-full">
                        <Img src={agent.image} alt={agent.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[0.9rem] font-medium">{agent.name}</p>
                        <p className="truncate text-[0.78rem] text-slate">{agent.role}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-5">
                    <PropertyActions variant="rail" title={p.title} refId={refId} url={url} />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-rule pt-4 text-[0.8rem] text-slate">
                    <span className="num">{AGENCY_PHONE.display}</span>
                    <FavoriteButton slug={p.slug} className="relative -m-2" />
                  </div>
                </div>

                <div id="enquiry" className="card p-6 sm:p-7">
                  <PropertyEnquiry propertyTitle={p.title} refId={refId} />
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ── Similar properties ────────────────────────────────────── */}
      {others.length > 0 && (
        <section className="border-t border-rule bg-mist py-20 sm:py-24 lg:py-32">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow index="01" className="reveal text-fog">
                  Similar properties
                </Eyebrow>
                <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
                  Others you may consider.
                </h2>
              </div>
              <TextLink href="/properties">All residences</TextLink>
            </div>
            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o, i) => (
                <PropertyCard
                  key={o.slug}
                  property={o}
                  index={i}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Mobile contact bar ────────────────────────────────────── */}
      <PropertyActions variant="bar" title={p.title} refId={refId} url={url} />
    </>
  );
}
