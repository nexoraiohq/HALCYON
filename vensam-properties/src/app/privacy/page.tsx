import type { Metadata } from "next";
import { Container, Section, Eyebrow } from "@/components/ui";
import PageHero from "@/components/page-hero";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Vensam Properties collects, why we hold it, how long we keep it, and the rights you can exercise at any time.",
  alternates: { canonical: "/privacy" },
};

const CLAUSES = [
  {
    n: "01",
    t: "Who we are",
    b: [
      "Vensam Properties, 18 Belgrave Mews, London SW1X 8RS, is the controller of the personal data described on this page. We are a RICS-regulated advisory with offices in London, New York and Singapore.",
    ],
  },
  {
    n: "02",
    t: "What we collect",
    b: [
      "Details you choose to give us — name, contact information, the brief you send through the enquiry form, and any correspondence that follows.",
      "Information arising from an instruction: identity and source-of-funds checks where the law requires them, and the records of a transaction once one exists.",
      "Limited technical data from visits to this site: pages requested, approximate location derived from an IP address, and device type. We do not build profiles from it.",
    ],
  },
  {
    n: "03",
    t: "Why we hold it",
    b: [
      "To answer enquiries, deliver mandates, keep the records a regulated firm must keep, and protect the business and its clients from fraud.",
      "We rely on contract, legal obligation and our legitimate interests. Where we rely on consent, you may withdraw it at any time. We do not sell personal data, and we do not use it for advertising.",
    ],
  },
  {
    n: "04",
    t: "This website",
    b: [
      "The site runs on strictly necessary cookies, and — only if you permit them — anonymous, aggregated analytics. You make that choice in the banner shown five seconds after your first visit, and can change it at any time from Cookie settings in the footer.",
      "There are no advertising cookies and no third-party advertising trackers. Traffic statistics, when enabled, cannot reasonably be used to identify you.",
    ],
  },
  {
    n: "05",
    t: "Who we share it with",
    b: [
      "Professional advisers and counsel, banks, our regulators and professional bodies, and service providers who process data on our instructions — each under duties of confidentiality, and each receiving only what their role requires.",
      "Where data moves outside the UK or EEA — our New York and Singapore offices, for example — we use approved safeguards such as adequacy decisions or standard contractual clauses.",
    ],
  },
  {
    n: "06",
    t: "How long we keep it",
    b: [
      "Enquiry correspondence: up to two years after the last contact. Client records: six years after an engagement ends, or longer where a law or a regulatory rule demands it. We then delete or anonymise it.",
    ],
  },
  {
    n: "07",
    t: "Your rights",
    b: [
      "You may ask for access to your data, for it to be corrected or erased, for its processing to be restricted or objected to, and — where processing rests on consent or contract — for a portable copy.",
      "You may also complain to the Information Commissioner's Office (ico.org.uk), though we would welcome the chance to put things right first.",
    ],
  },
  {
    n: "08",
    t: "Reaching us",
    b: [
      "Send a request through the enquiry form, or write to the London office marked “Privacy”. We respond within one month.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="What we hold, and why."
        intro="Vensam Properties is paid for judgement and for discretion — the same two principles govern how we treat personal information. This page explains it in plain terms."
        meta="Last updated · 15 October 2026"
      />

      <Section tone="paper" className="pb-20 sm:pb-24">
        <Container>
          <Eyebrow index="01" className="reveal text-fog">
            The principle
          </Eyebrow>
          <h2
            className="reveal display mt-5 max-w-[24ch] text-headline"
            style={{ ["--reveal-delay" as string]: "60ms" }}
          >
            We collect the least we can — and never sell it.
          </h2>
          <div
            className="reveal mt-8 grid gap-8 text-[1rem] leading-relaxed text-slate sm:grid-cols-2"
            style={{ ["--reveal-delay" as string]: "120ms" }}
          >
            <p>
              We collect the least we need to do the work, keep it only as long as a law or
              a relationship requires, and never pass it to anyone for their marketing.
            </p>
            <p>
              What follows covers the website and the enquiries that begin on it. If
              something here is unclear, ask us — the answer is part of the service.
            </p>
          </div>

          <ol className="mt-14 border-t border-rule">
            {CLAUSES.map((c, i) => (
              <li
                key={c.n}
                className="reveal grid gap-3 border-b border-rule py-8 lg:grid-cols-12 lg:gap-8"
                style={{ ["--reveal-delay" as string]: `${i * 50}ms` }}
              >
                <p className="num text-[1.1rem] font-semibold text-brass lg:col-span-2">
                  {c.n}
                </p>
                <h3 className="text-[1.1rem] font-semibold tracking-[-0.015em] lg:col-span-4">
                  {c.t}
                </h3>
                <div className="space-y-4 text-[0.95rem] leading-relaxed text-slate lg:col-span-6">
                  {c.b.map((p) => (
                    <p key={p.slice(0, 32)}>{p}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="mist" className="py-20 sm:py-24">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <Eyebrow index="02" className="reveal text-fog">
                Next
              </Eyebrow>
              <h2
                className="reveal display mt-5 max-w-[18ch] text-headline"
                style={{ ["--reveal-delay" as string]: "60ms" }}
              >
                Questions about your data?
              </h2>
              <p
                className="reveal mt-5 max-w-[34rem] text-[1rem] leading-relaxed text-slate"
                style={{ ["--reveal-delay" as string]: "120ms" }}
              >
                Ask for a copy of anything we hold, or ask us to remove it. Both requests
                are ordinary work for us.
              </p>
            </div>
            <div
              className="reveal flex flex-wrap gap-3"
              style={{ ["--reveal-delay" as string]: "180ms" }}
            >
              <Link href="/contact" className="btn btn-solid">
                Contact us
              </Link>
              <Link href="/terms" className="btn btn-quiet">
                Terms of use
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
