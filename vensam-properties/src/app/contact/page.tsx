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

const DIRECT_LINKS = [
  {
    label: "Email",
    value: "Vensaminvestmentlimited@gmail.com",
    href: "mailto:Vensaminvestmentlimited@gmail.com",
  },
  {
    label: "TikTok",
    value: "@vensam_propertykenya",
    href: "https://www.tiktok.com/@vensam_propertykenya",
  },
  {
    label: "Instagram",
    value: "Vensampoperty ke",
    href: "https://www.instagram.com/vensampopertyke",
  },
  {
    label: "Facebook",
    value: "Vensamproperty ke",
    href: "https://www.facebook.com/vensampropertyke",
  },
  {
    label: "Google",
    value: "vensam property kenya",
    href: "https://www.google.com/search?q=vensam+property+kenya",
  },
  {
    label: "Contact",
    value: "Call/WhatsApp 0722473703",
    href: "https://wa.me/254722473703",
  },
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
                <Eyebrow className="text-brass">Direct links</Eyebrow>
                <ul className="mt-7">
                  {DIRECT_LINKS.map((l) => (
                    <li key={l.label} className="border-b border-rule py-5 first:pt-0 last:border-0 last:pb-0">
                      <h2 className="text-[1.1rem] font-semibold tracking-[-0.015em]">{l.label}</h2>
                      <a
                        href={l.href}
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="link-chevron mt-2 inline-flex break-all text-[0.9rem]"
                      >
                        {l.value}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* "Other" section — commented out per request (kept for reference):
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
              */}
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
