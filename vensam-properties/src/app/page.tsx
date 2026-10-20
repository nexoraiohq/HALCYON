import Img from "@/components/img";
import Link from "next/link";
import type { Metadata } from "next";
import { Container, Section, SectionHead, Chevron, TextLink, Eyebrow } from "@/components/ui";
import DestinationRail from "@/components/destination-rail";
import PropertyCard from "@/components/property-card";
import { neighborhoods, testimonials, stats, services } from "@/lib/data";
import { getJournal, getProperties } from "@/lib/server-api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Vensam Properties — Private Real Estate Advisory",
  description:
    "Off-market acquisition, discreet sale and portfolio advisory. Residences currently offered across 41 countries — most of them never advertised.",
  alternates: { canonical: "/" },
};

const PRESS = [
  "Architectural Digest",
  "Robb Report",
  "Financial Times",
  "Monocle",
  "Wall Street Journal",
  "Forbes",
  "Condé Nast Traveller",
  "The World of Interiors",
];

export default async function HomePage() {
  const [properties, journal] = await Promise.all([getProperties(), getJournal()]);
  const featured = properties.filter((p) => p.featured);
  const showcase = featured.length > 0 ? featured : properties.slice(0, 3);
  const showcaseSlugs = new Set(showcase.map((p) => p.slug));
  const rest = properties.filter((p) => !showcaseSlugs.has(p.slug)).slice(0, 3);
  const onFileHeading =
    showcase.length >= properties.length
      ? `${properties.length} on file.`
      : `${showcase.length} of the ${properties.length} on file.`;
  const heroRegions = Array.from(new Set(properties.map((p) => p.region))).filter(Boolean);

  return (
    <>
      {/* ───────────────── HERO ───────────────── */}
      {/* min-h, not h: the section grows past the viewport slice instead of
          clipping the register bar when content or zoom makes it taller. */}
      <section className="relative isolate flex min-h-[max(92svh,40rem)] w-full flex-col overflow-hidden bg-void text-white">
        <Img
          src="/media/hero.jpg"
          alt="A modernist villa at twilight, its windows lit above a still pool"
          fill
          sizes="100vw"
          priority
          fetchPriority="high"
          className="object-cover object-[50%_52%]"
        />
        {/* Scrim — opens the twilight sky behind the wordmark, deepens the lower third */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.16)_30%,rgba(0,0,0,0.38)_62%,rgba(0,0,0,0.74)_100%)]" />

        <Container className="relative flex flex-1 flex-col pb-8 pt-16">
          <p
            className="hero-in ml-auto hidden max-w-[26ch] text-right text-[0.9rem] leading-snug tracking-[-0.006em] text-white/75 sm:block"
            style={{ ["--reveal-delay" as string]: "1000ms" }}
          >
            Private representation for houses
            <br />
            that rarely reach the market.
          </p>

          {/* The wordmark — VENSAM PROPERTY KENYA, PROPERTY KENYA at 1/4 the size of VENSAM */}
          <p
            aria-hidden="true"
            className="hero-in mt-4 select-none whitespace-nowrap text-center text-[min(13.5vw,11rem,20svh)] font-semibold uppercase leading-[0.84] tracking-[-0.018em] text-white sm:mt-5 sm:text-left"
            style={{ ["--reveal-delay" as string]: "80ms" }}
          >
            Vensam{" "}
            <span className="block text-[0.25em] leading-[1.1] tracking-[0.04em] sm:inline sm:leading-[0.84]">
              Property Kenya
            </span>
          </p>

          <div className="min-h-[1rem] flex-1" />

          <div className="mx-auto w-full max-w-[46rem] text-center">
            <h1 className="hero-in mx-auto max-w-[11ch] text-display">
              Places that outlive us.
            </h1>
            <p
              className="hero-in mx-auto mt-4 max-w-[54ch] text-[1.02rem] leading-relaxed tracking-[-0.01em] text-white/75"
              style={{ ["--reveal-delay" as string]: "1000ms" }}
            >
              We advise a small number of people on the most considered houses in the
              world — most of which are never advertised.
            </p>
          </div>

          {/* The register bar — the reference's search bar, wired to the real filters */}
          <div
            className="hero-in mt-8 flex items-center gap-1 rounded-pill bg-white p-1.5 pl-4 text-ink shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:gap-2 sm:pl-5"
            style={{ ["--reveal-delay" as string]: "1800ms" }}
          >
            <span className="eyebrow shrink-0 text-fog">Where</span>
            <span className="h-6 w-px shrink-0 bg-rule" />
            <div className="no-bar flex min-w-0 flex-1 items-center overflow-x-auto">
              {heroRegions.map((r, i) => (
                <Link
                  key={r}
                  href={`/properties?region=${encodeURIComponent(r)}`}
                  className={`shrink-0 px-3 py-2 text-[0.9rem] tracking-[-0.006em] text-slate transition-colors duration-300 hover:text-ink ${
                    i > 0 ? "border-l border-rule/70" : ""
                  }`}
                >
                  {r}
                </Link>
              ))}
            </div>
            <Link href="/properties" className="btn btn-solid shrink-0 text-[0.9rem] sm:text-base">
              <span className="sm:hidden">All residences</span>
              <span className="hidden sm:inline">View all residences</span>
              <Chevron />
            </Link>
          </div>
        </Container>
      </section>

      {/* ───────────────── PRESS ───────────────── */}
      <Section tone="paper" className="py-10 sm:py-12">
        <Container>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="eyebrow text-fog">As seen in</span>
            {PRESS.map((p) => (
              <span key={p} className="text-[0.82rem] tracking-[-0.006em] text-fog">
                {p}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      {/* ───────────────── STATEMENT ───────────────── */}
      <Section cv tone="paper" className="py-24 sm:py-32 lg:py-40">
        <Container size="text">
          <p className="reveal display mx-auto max-w-[24ch] text-center text-headline">
            Most property is sold twice — once to the person who buys it, and again, later,
            to the person who finally understands what they bought.
          </p>
          <p
            className="reveal mx-auto mt-8 max-w-[38rem] text-center text-[1.05rem] leading-relaxed tracking-[-0.01em] text-slate"
            style={{ ["--reveal-delay" as string]: "100ms" }}
          >
            We work exclusively on the first transaction. Fourteen of them a year, across
            forty-one countries, almost none of which are ever listed.
          </p>
          <div
            className="reveal mt-8 flex justify-center"
            style={{ ["--reveal-delay" as string]: "160ms" }}
          >
            <TextLink href="/about">Our story</TextLink>
          </div>
        </Container>
      </Section>

      {/* ───────────────── FEATURED RESIDENCES ───────────────── */}
      {showcase.length > 0 && (
        <Section cv tone="mist" className="py-24 sm:py-32 lg:py-40">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div>
                <Eyebrow index="01" className="reveal text-fog">
                  Currently offered
                </Eyebrow>
                <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
                  {onFileHeading}
                </h2>
              </div>
              <TextLink href="/properties">View all residences</TextLink>
            </div>

            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((p, i) => (
                <PropertyCard
                  key={p.slug}
                  property={p}
                  index={i}
                  ratio="aspect-[4/5]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ───────────────── CINEMATIC BAND ───────────────── */}
      <section className="relative isolate overflow-hidden bg-void">
        <Img
          src="/media/b1.jpg"
          alt="A long table, drawings and morning light in the Vensam Properties studio"
          fill
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />

        <Container className="relative py-24 sm:py-32 lg:py-44">
          <div className="max-w-[36rem]">
            <Eyebrow index="02" className="reveal text-white/50">
              The standard
            </Eyebrow>
            <h2 className="reveal display mt-5 text-headline text-white" style={{ ["--reveal-delay" as string]: "60ms" }}>
              We would rather show you four houses.
            </h2>
            <p
              className="reveal mt-6 text-[1.05rem] leading-relaxed tracking-[-0.01em] text-white/65"
              style={{ ["--reveal-delay" as string]: "120ms" }}
            >
              A tour of twenty properties is a way of avoiding a decision. Our advisors
              arrive with a brief they have already argued with you about — and a
              shortlist that usually runs to four.
            </p>

            <ul className="reveal mt-10 grid gap-px overflow-hidden rounded-card bg-white/12 sm:grid-cols-2" style={{ ["--reveal-delay" as string]: "180ms" }}>
              {[
                "Independent valuation model",
                "Structural and title diligence",
                "Conservation officer liaison",
                "Post-completion stewardship",
              ].map((item) => (
                <li key={item} className="bg-black/35 px-5 py-4 text-[0.9rem] text-white/80 backdrop-blur-sm">
                  {item}
                </li>
              ))}
            </ul>

            <div className="reveal mt-10" style={{ ["--reveal-delay" as string]: "240ms" }}>
              <Link href="/services" className="btn btn-ghost-light">
                How we work
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────────── DESTINATIONS ───────────────── */}
      <Section cv tone="paper" className="py-24 sm:py-32 lg:py-40">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <Eyebrow index="03" className="reveal text-fog">
                Where we work
              </Eyebrow>
              <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
                Five places we know by heart.
              </h2>
            </div>
            <TextLink href="/properties">All destinations</TextLink>
          </div>
        </Container>

        <DestinationRail items={neighborhoods} />
      </Section>

      {/* ───────────────── ADVISORY ───────────────── */}
      <Section cv tone="mist" className="py-24 sm:py-32 lg:py-40">
        <Container>
          <SectionHead
            eyebrow="Advisory"
            index="04"
            title="Four ways to work with us."
            intro="Whether you are buying, selling, holding or repairing, the same advisor stays with you from the first conversation to the day the keys change hands."
          />

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {services.map((s, i) => (
              <div
                key={s.n}
                className="reveal card group flex flex-col p-8 transition-colors duration-500 hover:bg-mist-2 sm:p-10"
                style={{ ["--reveal-delay" as string]: `${(i % 2) * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="num eyebrow text-brass">{s.n}</span>
                  <Chevron className="text-fog opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <h3 className="display mt-6 text-title transition-opacity duration-500 group-hover:opacity-60">
                  {s.title}
                </h3>
                <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-slate">{s.body}</p>
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
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ───────────────── INDEX / STATS ───────────────── */}
      <Section cv tone="paper" className="py-24 sm:py-32 lg:py-40">
        <Container>
          <Eyebrow index="05" className="reveal text-fog">
            The Vensam Properties Index
          </Eyebrow>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className="reveal" style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
                <p className="num display text-[clamp(2.4rem,5vw,4rem)] leading-none tracking-[-0.04em]">
                  {s.value}
                </p>
                <p className="mt-4 max-w-[18ch] text-[0.9rem] leading-snug text-slate">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ───────────────── TESTIMONIAL ───────────────── */}
      <Section cv tone="ink" className="py-24 sm:py-32 lg:py-40">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-3">
              <Eyebrow index="06" className="reveal text-white/45">
                In their words
              </Eyebrow>
            </div>
            <div className="lg:col-span-9">
              <figure className="reveal">
                <blockquote className="display max-w-[26ch] text-headline text-white">
                  “{testimonials[0].quote}”
                </blockquote>
                <figcaption className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-[0.95rem] font-medium text-white">
                    {testimonials[0].name}
                  </span>
                  <span className="text-[0.9rem] text-white/50">{testimonials[0].detail}</span>
                </figcaption>
              </figure>

              <div className="mt-16 grid gap-10 border-t border-white/12 pt-12 sm:grid-cols-2">
                {testimonials.slice(1).map((t) => (
                  <figure key={t.name} className="reveal">
                    <blockquote className="text-[1rem] leading-relaxed text-white/70">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="mt-5">
                      <span className="text-[0.9rem] font-medium text-white">{t.name}</span>{" "}
                      <span className="text-[0.85rem] text-white/45">— {t.detail}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ───────────────── MORE RESIDENCES ───────────────── */}
      {rest.length > 0 && (
        <Section cv tone="paper" className="py-24 sm:py-32 lg:py-40">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div>
                <Eyebrow index="07" className="reveal text-fog">
                  Further afield
                </Eyebrow>
                <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
                  Also on file.
                </h2>
              </div>
              <TextLink href="/properties">Full portfolio</TextLink>
            </div>

            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <PropertyCard
                  key={p.slug}
                  property={p}
                  index={i}
                  ratio="aspect-[4/3]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ───────────────── JOURNAL ───────────────── */}
      {journal.length > 0 && (
        <Section cv tone="mist" className="py-24 sm:py-32 lg:py-40">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <Eyebrow index="08" className="reveal text-fog">
                Journal
              </Eyebrow>
              <h2 className="reveal display mt-5 text-headline" style={{ ["--reveal-delay" as string]: "60ms" }}>
                Notes from the desk.
              </h2>
            </div>
            <TextLink href="/journal">Read the journal</TextLink>
          </div>

          <div className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-3">
            {journal.slice(0, 3).map((post, i) => (
              <article
                key={post.slug}
                className="reveal group"
                style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
              >
                <Link href="/journal" className="block">
                  <div className="frame aspect-[4/3] w-full rounded-card">
                    <Img
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="eyebrow text-brass">{post.category}</span>
                    <span className="num text-[0.8rem] text-fog">
                      {post.date} — {post.read}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[1.15rem] font-semibold leading-snug tracking-[-0.018em] transition-opacity duration-300 group-hover:opacity-55">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-[0.9rem] leading-relaxed text-slate">
                    {post.excerpt}
                  </p>
                </Link>
              </article>
            ))}
          </div>
          </Container>
        </Section>
      )}

      {/* ───────────────── CTA ───────────────── */}
      <section className="relative isolate overflow-hidden bg-void">
        <Img
          src="/media/n3.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/35" />

        <Container className="relative py-28 text-center sm:py-36 lg:py-44">
          <div className="mx-auto max-w-[42rem]">
            <p className="eyebrow reveal text-white/50">Private enquiry</p>
            <h2 className="reveal display mt-5 text-display text-white" style={{ ["--reveal-delay" as string]: "60ms" }}>
              The right house rarely reaches the market.
            </h2>
            <p
              className="reveal mx-auto mt-7 max-w-[34rem] text-[1.1rem] leading-relaxed tracking-[-0.012em] text-white/65"
              style={{ ["--reveal-delay" as string]: "120ms" }}
            >
              Tell us the brief — even the vague one. Ninety-six per cent of what we place
              is never listed, so the conversation is the search.
            </p>
            <div
              className="reveal mt-10 flex flex-wrap items-center justify-center gap-3"
              style={{ ["--reveal-delay" as string]: "180ms" }}
            >
              <Link href="/contact" className="btn btn-light">
                Begin a conversation
              </Link>
              <Link href="/properties" className="btn btn-ghost-light">
                Browse residences
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
