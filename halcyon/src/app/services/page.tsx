import type { Metadata } from "next";
import Img from "@/components/img";
import Link from "next/link";
import { Container, Section, Eyebrow } from "@/components/ui";
import PageHero from "@/components/page-hero";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Advisory",
  description:
    "Private acquisition, discreet sale, portfolio advisory and restoration delivery — the four ways Halcyon works with clients across 41 countries.",
  alternates: { canonical: "/services" },
};

const PROCESS = [
  { n: "01", t: "Brief", b: "One conversation, usually ninety minutes, usually over nothing in particular. We are listening for what you would not put in an email." },
  { n: "02", t: "Search", b: "Against the register first — four hundred residences held without publication — then the open market, which is where most of our competitors stop." },
  { n: "03", t: "Test", b: "Price model, title, structure, planning risk and, where relevant, conservation consent. Written up in a document you can hand to a lawyer as it stands." },
  { n: "04", t: "Close", b: "Negotiation without a competing bidder in the room, and an advisor who stays on the file through completion and the first winter." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Advisory"
        title="Four ways to work with us."
        intro="The same advisor stays with you from the first conversation to the day the keys change hands. No handovers, no call centres, no junior on the other end of the phone."
        meta="Engaged in 41 countries"
      />

      <Section tone="paper" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s, i) => (
              <article
                key={s.n}
                className="reveal card flex flex-col p-8 sm:p-10"
                style={{ ["--reveal-delay" as string]: `${(i % 2) * 70}ms` }}
              >
                <span className="num eyebrow text-brass">{s.n}</span>
                <h2 className="display mt-6 text-title">{s.title}</h2>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-slate">{s.body}</p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="rounded-pill bg-paper px-3 py-1.5 text-[0.78rem] tracking-[-0.006em] text-slate"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <section className="relative isolate overflow-hidden bg-void">
        <Img
          src="/media/b2.jpg"
          alt="A quiet meeting room with a long table and city light"
          fill
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-[38rem]">
            <Eyebrow index="05" className="reveal text-white/50">
              Engagement
            </Eyebrow>
            <h2 className="reveal display mt-5 text-headline text-white" style={{ ["--reveal-delay" as string]: "60ms" }}>
              We are paid a retainer, not a bonus.
            </h2>
            <p className="reveal mt-6 text-[1.05rem] leading-relaxed text-white/65" style={{ ["--reveal-delay" as string]: "120ms" }}>
              Halcyon works on fixed advisory retainers with a transparent success
              component agreed in writing before the search begins. We do not take a higher
              fee for pushing a higher number — the incentive runs the other way.
            </p>
            <dl className="reveal mt-12 grid gap-px overflow-hidden rounded-card bg-white/12 sm:grid-cols-3" style={{ ["--reveal-delay" as string]: "180ms" }}>
              {[
                { k: "Retainer", v: "Fixed, monthly" },
                { k: "Success", v: "Agreed in writing" },
                { k: "Conflicts", v: "Declared, always" },
              ].map((x) => (
                <div key={x.k} className="bg-black/40 px-6 py-5 backdrop-blur-sm">
                  <dt className="eyebrow text-white/50">{x.k}</dt>
                  <dd className="mt-3 text-[0.95rem] text-white/85">{x.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <Section tone="mist" className="py-20 sm:py-28 lg:py-36">
        <Container>
          <Eyebrow index="06" className="reveal text-fog">
            Process
          </Eyebrow>
          <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
            How a mandate actually runs.
          </h2>
          <p className="reveal mt-6 max-w-[36rem] text-[1.05rem] leading-relaxed text-slate" style={{ ["--reveal-delay" as string]: "120ms" }}>
            From the first conversation to the first winter in the house — typically
            fourteen to forty weeks, depending on consent.
          </p>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <div
                key={p.n}
                className="reveal card p-7 sm:p-8"
                style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
              >
                <span className="num eyebrow text-brass">{p.n}</span>
                <h3 className="display mt-6 text-title">{p.t}</h3>
                <p className="mt-4 text-[0.9rem] leading-relaxed text-slate">{p.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper" className="py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <Eyebrow index="07" className="reveal text-fog">
                Begin
              </Eyebrow>
              <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
                Bring us the vague brief.
              </h2>
            </div>
            <Link
              href="/contact"
              className="btn btn-solid reveal"
              style={{ ["--reveal-delay" as string]: "120ms" }}
            >
              Start a conversation
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
