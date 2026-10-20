import type { Metadata } from "next";
import { Container, Section, Eyebrow } from "@/components/ui";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Private Enquiry",
  description:
    "Tell us the brief — even the vague one. Vensam Properties replies to every enquiry within one business day, from a named advisor, never a call centre.",
  alternates: { canonical: "/contact" },
};

const OFFICES = [
  { city: "London", lines: ["18 Belgrave Mews", "London SW1X 8RS"], tel: "+44 20 7946 0100" },
  { city: "New York", lines: ["770 Park Avenue", "New York NY 10021"], tel: "+1 212 555 0100" },
  { city: "Singapore", lines: ["6 Battery Road, #22", "Singapore 049909"], tel: "+65 6555 0100" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Private enquiry"
        title="Tell us the brief."
        intro="Vague is fine. So is a postcode and a feeling. Every enquiry is answered by a named advisor within one business day."
        meta="No call centres · No mailing list"
      />

      <Section tone="paper" className="pb-20 sm:pb-28 lg:pb-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            <aside className="lg:col-span-5">
              <div className="card p-8">
                <Eyebrow className="text-brass">Direct lines</Eyebrow>
                <ul className="mt-7">
                  {OFFICES.map((o) => (
                    <li key={o.city} className="border-b border-rule py-5 first:pt-0 last:border-0 last:pb-0">
                      <h2 className="text-[1.1rem] font-semibold tracking-[-0.015em]">{o.city}</h2>
                      <p className="mt-2 text-[0.9rem] leading-relaxed text-slate">
                        {o.lines.join(", ")}
                      </p>
                      <a href={`tel:${o.tel.replace(/[\s+]/g, "")}`} className="link-chevron num mt-3 inline-flex text-[0.9rem]">
                        {o.tel}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-rule pt-8">
                <Eyebrow className="text-brass">Other</Eyebrow>
                <dl className="mt-6 space-y-4 text-[0.9rem]">
                  <div>
                    <dt className="text-fog">General</dt>
                    <dd className="mt-1">
                      <a href="mailto:hello@vensamproperties.estate" className="link-chevron">
                        hello@vensamproperties.estate
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-fog">Press</dt>
                    <dd className="mt-1">
                      <a href="mailto:press@vensamproperties.estate" className="link-chevron">
                        press@vensamproperties.estate
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-fog">Careers</dt>
                    <dd className="mt-1">
                      <a href="mailto:studio@vensamproperties.estate" className="link-chevron">
                        studio@vensamproperties.estate
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
