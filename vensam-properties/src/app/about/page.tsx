import type { Metadata } from "next";
import Img from "@/components/img";
import Link from "next/link";
import { Container, Section, Eyebrow } from "@/components/ui";
import PageHero from "@/components/page-hero";
import { stats } from "@/lib/data";

export const metadata: Metadata = {
  title: "The House",
  description:
    "Vensam Properties was founded in 2009 on a single premise: that the best houses are never advertised, and that the advisor should be paid for judgement, not for footfall.",
  alternates: { canonical: "/about" },
};

const TIMELINE = [
  { y: "2009", t: "Two rooms in Belgravia", b: "Eleanor Vance and James Okafor leave larger firms to take four mandates a year — and refuse the rest." },
  { y: "2013", t: "The first off-market ledger", b: "Our private register reaches 300 residences held without publication. It is still the spine of the business." },
  { y: "2017", t: "Research becomes a department", b: "David Ashworth joins from a merchant bank. The Vensam Properties Index begins quarterly publication across ten markets." },
  { y: "2021", t: "Fourteen countries", b: "New York, Los Angeles and Singapore open. Delivery — architects, consent, programme — becomes a formal practice." },
  { y: "2025", t: "Forty-one countries, one standard", b: "$14.2B transacted. Ninety-six per cent of it without a public listing." },
];

const VALUES = [
  { n: "01", t: "Fewer mandates", b: "We accept roughly a third of the instructions we are offered. An advisor with twenty live listings cannot give any of them a proper thought." },
  { n: "02", t: "Own the number", b: "Every price we quote is built from our own model. If we cannot defend it over dinner with a surveyor, we do not quote it." },
  { n: "03", t: "Say the uncomfortable thing", b: "Our advisors are measured on whether the client still speaks to them five years later — not on whether the deal closed." },
  { n: "04", t: "Discretion is the product", b: "Photography, naming, and even the address stay withheld until both sides have agreed. There is no such thing as a soft launch." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="The house"
        title="A private advisory, built on restraint."
        intro="Vensam Properties was founded in 2009 on one premise: the best houses are never advertised, and an advisor should be paid for judgement — not for footfall."
        meta="Founded London · 2009"
      />

      <section className="bg-paper pb-16 sm:pb-20">
        <Container>
          <div className="frame aspect-[16/9] w-full rounded-card sm:aspect-[21/9]">
            <Img
              src="/media/b1.jpg"
              alt="The Vensam Properties studio — a long table, drawings, and morning light"
              fill
              sizes="100vw"
              priority
              fetchPriority="high"
              className="object-cover"
            />
          </div>
          <p className="mt-4 text-caption text-fog">The studio, Belgrave Mews — London</p>
        </Container>
      </section>

      <Section tone="paper" className="py-20 sm:py-28 lg:py-36">
        <Container>
          <p className="reveal display max-w-[26ch] text-headline">
            Estate agency is built on volume. We built Vensam Properties because the houses we
            admired most were never sold that way.
          </p>
          <div className="reveal mt-10 grid gap-8 text-[1rem] leading-relaxed text-slate sm:grid-cols-2" style={{ ["--reveal-delay" as string]: "100ms" }}>
            <p>
              Seventeen years on, we still hold fewer instructions than we are offered. An
              advisor carrying twenty live listings cannot give any of them a proper
              thought, and the client always finds out.
            </p>
            <p>
              So the practice is deliberately small, deliberately slow, and deliberately
              uninterested in being famous for the wrong reasons. The work speaks quietly,
              to the twelve people who need to hear it.
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="mist" className="py-20 sm:py-28 lg:py-36">
        <Container>
          <Eyebrow index="01" className="reveal text-fog">
            How we behave
          </Eyebrow>
          <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
            Four rules we do not bend.
          </h2>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <div
                key={v.n}
                className="reveal card p-8 sm:p-10"
                style={{ ["--reveal-delay" as string]: `${(i % 2) * 70}ms` }}
              >
                <span className="num eyebrow text-brass">{v.n}</span>
                <h3 className="display mt-6 text-title">{v.t}</h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-slate">{v.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="ink" className="py-20 sm:py-28 lg:py-36">
        <Container>
          <Eyebrow index="02" className="reveal text-white/45">
            By the numbers
          </Eyebrow>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className="reveal" style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
                <p className="num display text-[clamp(2.4rem,5vw,4rem)] leading-none tracking-[-0.04em] text-white">
                  {s.value}
                </p>
                <p className="mt-4 max-w-[18ch] text-[0.9rem] leading-snug text-white/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper" className="py-20 sm:py-28 lg:py-36">
        <Container>
          <Eyebrow index="03" className="reveal text-fog">
            Seventeen years
          </Eyebrow>
          <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
            A short history.
          </h2>
          <p className="reveal mt-6 max-w-[36rem] text-[1.05rem] leading-relaxed text-slate" style={{ ["--reveal-delay" as string]: "120ms" }}>
            No pivots, no rebrands, no acquisitions. The same standard, applied in more
            places.
          </p>

          <ol className="mt-14 border-t border-rule">
            {TIMELINE.map((e, i) => (
              <li
                key={e.y}
                className="reveal grid gap-3 border-b border-rule py-8 lg:grid-cols-12 lg:gap-8"
                style={{ ["--reveal-delay" as string]: `${i * 50}ms` }}
              >
                <p className="num text-[1.1rem] font-semibold text-brass lg:col-span-2">{e.y}</p>
                <h3 className="text-[1.1rem] font-semibold tracking-[-0.015em] lg:col-span-4">{e.t}</h3>
                <p className="text-[0.95rem] leading-relaxed text-slate lg:col-span-6">{e.b}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="mist" className="py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <Eyebrow index="04" className="reveal text-fog">
                Next
              </Eyebrow>
              <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
                The four ways we work.
              </h2>
            </div>
            <div className="reveal flex flex-wrap gap-3" style={{ ["--reveal-delay" as string]: "120ms" }}>
              <Link href="/services" className="btn btn-solid">
                Advisory
              </Link>
              <Link href="/agents" className="btn btn-quiet">
                Meet the people
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
