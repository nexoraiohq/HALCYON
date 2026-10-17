import type { Metadata } from "next";
import { Container, Section, Eyebrow } from "@/components/ui";
import PageHero from "@/components/page-hero";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms on which you may use this website, its content, and the enquiries you send through it.",
  alternates: { canonical: "/terms" },
};

const CLAUSES = [
  {
    n: "01",
    t: "Agreement",
    b: [
      "By using this site you accept these terms. If you do not accept them, please do not use it. They apply from the moment the page loads, whether or not you have read them — so we have kept them short.",
    ],
  },
  {
    n: "02",
    t: "About Halcyon",
    b: [
      "Halcyon Private Real Estate is a RICS-regulated advisory at 18 Belgrave Mews, London SW1X 8RS, with offices in New York and Singapore. References to “we”, “us” and “our” mean Halcyon and its advisors.",
    ],
  },
  {
    n: "03",
    t: "Information, not advice",
    b: [
      "The content of this site — including property particulars, pricing commentary and the Halcyon Index — is general information. It is not legal, tax, financial or investment advice, and it should not be relied upon as such.",
      "Nothing on the site constitutes a valuation. Figures, areas and descriptions are indicative and subject to survey, verification and change without notice.",
    ],
  },
  {
    n: "04",
    t: "Properties and enquiries",
    b: [
      "An enquiry, a viewing request or a message sent through this site does not create a contract, an offer, or any obligation on either party. Engagements begin only under a separate written letter of engagement.",
      "Many of our residences are shared in confidence. Particulars are provided solely for the purpose of genuinely considering the property, and may not be circulated, published or used for any other purpose.",
    ],
  },
  {
    n: "05",
    t: "Intellectual property",
    b: [
      "The site — its design, copy, photography, the Halcyon wordmark and the Halcyon Index — belongs to us or to our licensors. You may view it for your own, non-commercial consideration of our services.",
      "Any other reproduction, scraping or redistribution requires our written permission.",
    ],
  },
  {
    n: "06",
    t: "Acceptable use",
    b: [
      "You may not use the site unlawfully, attempt to gain unauthorised access to it or to the systems behind it, interfere with its operation, harvest data from it by automated means, or present yourself as Halcyon or its agents.",
    ],
  },
  {
    n: "07",
    t: "Third-party links",
    b: [
      "Links to external sites are offered for convenience. We do not control their content or their practices, and accepting a link is not an endorsement of either.",
    ],
  },
  {
    n: "08",
    t: "Liability",
    b: [
      "The site is provided as it stands. To the fullest extent the law allows, we exclude implied warranties as to its accuracy, availability and fitness for a particular purpose, and we accept no liability for indirect or consequential loss.",
      "Nothing in these terms limits liability that cannot be limited by law — including liability for fraud, for death or personal injury caused by negligence, or any right you have under consumer law.",
    ],
  },
  {
    n: "09",
    t: "Privacy",
    b: [
      "How we collect and handle personal data is set out in our privacy notice, which forms part of these terms.",
    ],
  },
  {
    n: "10",
    t: "Changes",
    b: [
      "We may amend these terms from time to time; the current version always lives on this page with its date at the top. Continuing to use the site after a change means you accept it.",
    ],
  },
  {
    n: "11",
    t: "Governing law",
    b: [
      "These terms are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction — without depriving you of any mandatory protection available where you live.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Terms"
        title="The terms of using this site."
        intro="What this site is for, what it does not promise, and what happens when an enquiry becomes a conversation. Written to be read once."
        meta="Effective · 15 October 2026"
      />

      <Section tone="paper" className="pb-20 sm:pb-24">
        <Container>
          <Eyebrow index="01" className="reveal text-fog">
            The agreement
          </Eyebrow>
          <h2
            className="reveal display mt-5 max-w-[24ch] text-headline"
            style={{ ["--reveal-delay" as string]: "60ms" }}
          >
            Use the site, and these terms apply.
          </h2>
          <div
            className="reveal mt-8 grid gap-8 text-[1rem] leading-relaxed text-slate sm:grid-cols-2"
            style={{ ["--reveal-delay" as string]: "120ms" }}
          >
            <p>
              Nothing here replaces the letter of engagement that begins an actual
              instruction — but everything below applies from the moment you open the site.
            </p>
            <p>
              We have kept the language plain on purpose. If a clause still reads badly to
              you, that is worth telling us about.
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
                Questions on these terms?
              </h2>
              <p
                className="reveal mt-5 max-w-[34rem] text-[1rem] leading-relaxed text-slate"
                style={{ ["--reveal-delay" as string]: "120ms" }}
              >
                Write to us before you rely on anything here — or read how we handle the
                information you send while asking.
              </p>
            </div>
            <div
              className="reveal flex flex-wrap gap-3"
              style={{ ["--reveal-delay" as string]: "180ms" }}
            >
              <Link href="/contact" className="btn btn-solid">
                Contact us
              </Link>
              <Link href="/privacy" className="btn btn-quiet">
                Privacy policy
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
