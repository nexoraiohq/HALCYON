import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import PropertyBrowser from "@/components/property-browser";
import { getProperties } from "@/lib/server-api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Residences",
  description:
    "Fourteen residences currently offered by Halcyon — from a Malibu cliffside estate to a Grade II listed Georgian townhouse in Kensington. Most are never publicly listed.",
  alternates: { canonical: "/properties" },
};

export default async function PropertiesPage() {
  const list = await getProperties();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: list.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Residence",
        name: p.title,
        url: `https://www.halcyon.estate/properties/${p.slug}`,
        description: p.blurb,
        floorSize: { "@type": "QuantitativeValue", value: p.area, unitCode: "FTK" },
        numberOfRooms: p.beds,
        address: { "@type": "PostalAddress", addressLocality: p.location },
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow="Currently offered"
        title={
          <>
            Fourteen houses.
            <br />
            One shortlist.
          </>
        }
        intro="Nothing here is syndicated. If a residence has a board on the lawn, it is because we advised it — and you will not find it anywhere else."
        meta={`${list.length} residences · 6 countries`}
      />

      <PropertyBrowser properties={list}>
        <div className="reveal card mt-24 p-10 text-center sm:p-16">
          <p className="display max-w-[22ch] mx-auto text-headline">
            Not seeing it? Most are never listed.
          </p>
          <p className="mx-auto mt-5 max-w-[34rem] text-[1rem] leading-relaxed text-slate">
            Tell us the brief and we will search against it — including the ninety-six
            per cent of stock that never reaches a portal.
          </p>
          <a href="/contact" className="btn btn-solid mt-8">
            Start a private search
          </a>
        </div>
      </PropertyBrowser>
    </>
  );
}
