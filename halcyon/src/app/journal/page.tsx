import type { Metadata } from "next";
import Img from "@/components/img";
import Link from "next/link";
import { Container, Section, Eyebrow, Chevron } from "@/components/ui";
import PageHero from "@/components/page-hero";
import { getJournal } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Perspectives, method and research from the Halcyon desk — including the quarterly Index covering fourteen prime markets.",
  alternates: { canonical: "/journal" },
};

export default async function JournalPage() {
  const journal = await getJournal();
  const [lead, ...rest] = journal;

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Notes from the desk."
        intro="Perspective, method and the quarterly Index. Written for clients first and published second — which is why there is no newsletter pop-up."
        meta="Published quarterly · Since 2017"
      />

      <Section tone="paper" className="pb-20 sm:pb-28 lg:pb-32">
        <Container>
          <article className="reveal group border-b border-rule pb-16">
            <Link href="/journal" className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="frame aspect-[16/10] w-full rounded-card lg:col-span-7 lg:aspect-auto lg:h-[54vh]">
                <Img
                  src={lead.image}
                  alt={lead.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                  fetchPriority="high"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center lg:col-span-5">
                <div className="flex items-center gap-3">
                  <span className="eyebrow text-brass">{lead.category}</span>
                  <span className="num text-[0.8rem] text-fog">{lead.date}</span>
                </div>
                <h2 className="display mt-5 text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.12] tracking-[-0.025em] transition-opacity duration-300 group-hover:opacity-60">
                  {lead.title}
                </h2>
                <p className="mt-5 text-[1rem] leading-relaxed text-slate">{lead.excerpt}</p>
                <span className="link-chevron mt-8">
                  Read — {lead.read}
                  <Chevron />
                </span>
              </div>
            </Link>
          </article>

          <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <li
                key={post.slug}
                className="reveal"
                style={{ ["--reveal-delay" as string]: `${(i % 3) * 70}ms` }}
              >
                <article className="group">
                  <Link href="/journal" className="block">
                    <div className="frame aspect-[4/3] w-full rounded-card">
                      <Img
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="eyebrow text-brass">{post.category}</span>
                      <span className="num text-[0.8rem] text-fog">{post.read}</span>
                    </div>
                    <h2 className="mt-3 text-[1.15rem] font-semibold leading-snug tracking-[-0.018em] transition-opacity duration-300 group-hover:opacity-55">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-[0.9rem] leading-relaxed text-slate">
                      {post.excerpt}
                    </p>
                    <p className="mt-4 text-[0.8rem] text-fog">{post.date}</p>
                  </Link>
                </article>
              </li>
            ))}
          </ul>

          <div className="reveal card mt-24 grid gap-10 p-8 sm:grid-cols-2 sm:p-12 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Eyebrow className="text-brass">The Halcyon Index · Q4 2025</Eyebrow>
              <p className="display mt-5 max-w-[24ch] text-title">
                Fourteen prime markets, one methodology, published every quarter since 2017.
              </p>
            </div>
            {[
              { k: "Annual", v: "+4.1%" },
              { k: "Markets", v: "14" },
              { k: "Since", v: "2017" },
            ].map((s) => (
              <div key={s.k} className="border-t border-rule pt-5 lg:border-t-0 lg:border-l lg:border-rule lg:pl-8">
                <p className="text-[0.82rem] text-slate">{s.k}</p>
                <p className="num display mt-3 text-[2.2rem] leading-none tracking-[-0.03em]">
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
