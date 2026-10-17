import type { Metadata } from "next";
import Img from "@/components/img";
import Link from "next/link";
import { Container, Section, Eyebrow } from "@/components/ui";
import PageHero from "@/components/page-hero";
import { getAgents } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "People",
  description:
    "Six advisors, four offices, one standard. Meet the Halcyon team — founding partners, directors and the head of our private office.",
  alternates: { canonical: "/agents" },
};

export default async function AgentsPage() {
  const agents = await getAgents();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: agents.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: a.name,
        jobTitle: a.role,
        worksFor: { "@type": "RealEstateAgent", name: "Halcyon Private Real Estate" },
        telephone: a.phone,
        email: a.email,
        image: a.image,
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
        eyebrow="People"
        title="Six advisors. One standard."
        intro="Every client is assigned a single advisor who stays on the file. What follows is who you are most likely to end up talking to."
        meta="London · New York · Los Angeles · Singapore"
      />

      <Section tone="paper" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a, i) => (
              <li
                key={a.slug}
                className="reveal group"
                style={{ ["--reveal-delay" as string]: `${(i % 3) * 70}ms` }}
              >
                <div className="frame aspect-[4/5] w-full rounded-card">
                  <Img
                    src={a.image}
                    alt={`${a.name}, ${a.role}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={i < 3}
                    className="object-cover"
                  />
                </div>

                <p className="eyebrow mt-5 text-brass">{a.role}</p>
                <h2 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.018em] transition-opacity duration-300 group-hover:opacity-55">
                  {a.name}
                </h2>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-slate">{a.bio}</p>

                <dl className="mt-5 space-y-1.5 border-t border-rule pt-4 text-[0.82rem]">
                  <div className="flex gap-3">
                    <dt className="w-[4.5rem] shrink-0 text-fog">Focus</dt>
                    <dd className="text-slate">{a.focus}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-[4.5rem] shrink-0 text-fog">Languages</dt>
                    <dd className="text-slate">{a.languages}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-5">
                  <a href={`mailto:${a.email}`} className="link-chevron">
                    Email
                  </a>
                  <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="link-chevron num">
                    {a.phone}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="ink" className="py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <Eyebrow index="01" className="reveal text-white/45">
                Join us
              </Eyebrow>
              <h2 className="reveal display mt-5 max-w-[16ch] text-headline text-white" style={{ ["--reveal-delay" as string]: "60ms" }}>
                We hire three times a decade.
              </h2>
              <p className="reveal mt-6 max-w-md text-[1rem] leading-relaxed text-white/55" style={{ ["--reveal-delay" as string]: "120ms" }}>
                No open roles today. Send a note anyway — the good ones always arrive
                before the posting does.
              </p>
            </div>
            <Link
              href="/contact"
              className="btn btn-ghost-light reveal"
              style={{ ["--reveal-delay" as string]: "180ms" }}
            >
              Write to us
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
