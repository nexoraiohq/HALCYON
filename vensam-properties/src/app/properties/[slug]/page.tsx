import type { Metadata } from "next";
import Img from "@/components/img";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, TextLink } from "@/components/ui";
import PropertyCard from "@/components/property-card";
import FavoriteButton from "@/components/favorite-button";
import PropertyStatusBadge from "@/components/property-status-badge";
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
  const agent = agentList.find((a) => a.slug === p.agent);
  const others = all.filter((x) => x.slug !== p.slug).slice(0, 3);
  const price = p.price >= 1_000_000 ? `$${(p.price / 1_000_000).toFixed(1)}M` : `$${p.price}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: p.title,
    url: `https://www.vensamproperties.estate/properties/${p.slug}`,
    description: p.blurb,
    image: p.image,
    dateBuilt: p.year ? String(p.year) : undefined,
    floorSize: { "@type": "QuantitativeValue", value: p.area, unitCode: "FTK" },
    numberOfBedrooms: p.beds,
    numberOfBathroomsTotal: p.baths,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.location,
      addressRegion: p.region,
      addressCountry: "GB",
    },
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "USD",
      availability: p.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
    broker: {
      "@type": "RealEstateAgent",
      name: "Vensam Properties",
      url: "https://www.vensamproperties.estate",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-paper pt-24 sm:pt-28">
        <Container>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 py-5 text-[0.82rem] text-slate">
            <Link href="/properties" className="transition-colors hover:text-ink">
              Residences
            </Link>
            <span aria-hidden className="text-fog">/</span>
            <span className="text-ink">{p.title}</span>
          </nav>

          <div className="grid gap-3 pb-3 sm:grid-cols-12">
            <div className="frame relative aspect-[16/10] w-full rounded-card sm:col-span-8 sm:aspect-auto sm:h-[62vh]">
              <Img
                src={p.gallery[0] || p.image}
                alt={`${p.title} — principal view`}
                fill
                sizes="(max-width: 640px) 100vw, 66vw"
                priority
                fetchPriority="high"
                className="object-cover"
              />
              <PropertyStatusBadge status={p.status} sold={p.sold} className="absolute left-5 top-5" />
              <FavoriteButton slug={p.slug} className="absolute bottom-5 right-5" />
            </div>
            <div className="hidden gap-3 sm:col-span-4 sm:grid sm:grid-rows-2">
              {p.gallery.slice(1, 3).map((g, i) => (
                <div key={g} className="frame relative h-full w-full rounded-card">
                  <Img
                    src={g}
                    alt={`${p.title} — interior ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="reveal eyebrow text-brass">
                {p.type} ·{" "}
                {p.sold ? <span className="text-red-600">Sold</span> : p.status}
              </p>
              <h1 className="reveal display mt-5 text-display" style={{ ["--reveal-delay" as string]: "70ms" }}>
                {p.title}
              </h1>
              <p className="reveal mt-4 text-[1.05rem] text-slate" style={{ ["--reveal-delay" as string]: "120ms" }}>
                {p.location}
              </p>

              <dl
                className="reveal mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-rule sm:grid-cols-4"
                style={{ ["--reveal-delay" as string]: "170ms" }}
              >
                {[
                  { k: "Bedrooms", v: String(p.beds) },
                  { k: "Bathrooms", v: String(p.baths) },
                  { k: "Interior", v: `${p.area.toLocaleString()} sq ft` },
                  { k: "Status", v: p.sold ? "Sold" : p.status, red: Boolean(p.sold) },
                ].map((s) => (
                  <div key={s.k} className="bg-mist px-5 py-5">
                    <dt className="text-[0.8rem] text-slate">{s.k}</dt>
                    <dd
                      className={`num mt-2.5 text-[1.15rem] font-semibold tracking-[-0.02em] ${
                        s.red ? "text-red-600" : ""
                      }`}
                    >
                      {s.v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="reveal mt-12 space-y-5" style={{ ["--reveal-delay" as string]: "220ms" }}>
                <p className="text-[1.15rem] leading-relaxed tracking-[-0.012em] text-ink">
                  {p.blurb}
                </p>
                {p.description.map((para) => (
                  <p key={para.slice(0, 24)} className="text-[1rem] leading-relaxed text-slate">
                    {para}
                  </p>
                ))}
              </div>

              <div className="reveal mt-14" style={{ ["--reveal-delay" as string]: "260ms" }}>
                <Eyebrow className="text-brass">Particulars</Eyebrow>
                <ul className="mt-6 grid gap-px overflow-hidden rounded-card bg-rule sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="bg-mist px-5 py-4 text-[0.9rem] text-slate">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="card sticky top-24 p-7 sm:p-8">
                <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-6">
                  <div>
                    <p className="text-[0.82rem] text-slate">{p.status === "For Rent" ? "Guide — monthly" : "Guide"}</p>
                    <p className="num mt-2 text-[2.4rem] font-semibold leading-none tracking-[-0.03em]">
                      {price}
                      {p.status === "For Rent" && (
                        <span className="text-[1rem] font-medium tracking-[-0.01em] text-slate"> /mo</span>
                      )}
                    </p>
                  </div>
                  <p className={`eyebrow ${p.sold ? "text-red-600" : "text-brass"}`}>{p.sold ? "Sold" : p.status}</p>
                </div>

                <dl className="mt-6 space-y-3 text-[0.88rem]">
                  {[
                    ...(p.year ? [["Built", String(p.year)]] : []),
                    ...(p.lot ? [["Land", p.lot]] : []),
                    ["Type", p.type],
                    ["Region", p.region],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4">
                      <dt className="text-slate">{k}</dt>
                      <dd className="num text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>

                {agent && (
                  <div className="mt-7 flex items-center gap-4 border-t border-rule pt-6">
                    <div className="frame relative size-12 shrink-0 rounded-full">
                      <Img src={agent.image} alt={agent.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.95rem] font-medium">{agent.name}</p>
                      <p className="mt-0.5 truncate text-[0.82rem] text-slate">{agent.role}</p>
                    </div>
                  </div>
                )}

                <Link href="/contact" className="btn btn-solid mt-7 w-full">
                  Arrange a private viewing
                </Link>
                <a href="tel:+442079460100" className="btn btn-quiet mt-3 w-full">
                  Call +44 20 7946 0100
                </a>
                <p className="mt-5 text-center text-[0.78rem] leading-relaxed text-fog">
                  Viewings are accompanied and by appointment only.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {others.length > 0 && (
        <section className="border-t border-rule bg-mist py-20 sm:py-24 lg:py-32">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow index="01" className="reveal text-fog">
                  Also on file
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
    </>
  );
}
