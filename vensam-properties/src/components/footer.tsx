import Link from "next/link";
import { Container } from "./ui";
import CookieSettingsButton from "./cookie-settings-button";
import { AREAS_SERVED } from "@/lib/data";

const COLS = [
  {
    title: "Residences",
    links: [
      { href: "/properties", label: "All residences" },
      { href: "/properties?status=For+Rent", label: "For rent" },
      { href: "/properties?region=Europe", label: "Europe" },
      { href: "/properties?region=Mediterranean", label: "Mediterranean" },
      { href: "/properties?region=Americas", label: "Americas" },
    ],
  },
  {
    title: "Advisory",
    links: [
      { href: "/services", label: "Private acquisition" },
      { href: "/services", label: "Discreet sale" },
      { href: "/services", label: "Portfolio advisory" },
      { href: "/services", label: "Restoration & delivery" },
    ],
  },
  {
    title: "The House",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/agents", label: "People" },
      { href: "/journal", label: "Journal" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

const OFFICES = [
  { city: "London", lines: ["18 Belgrave Mews", "London SW1X 8RS"], tel: "+44 20 7946 0100" },
  { city: "New York", lines: ["770 Park Avenue", "New York NY 10021"], tel: "+1 212 555 0100" },
  { city: "Singapore", lines: ["6 Battery Road, #22", "Singapore 049909"], tel: "+65 6555 0100" },
];

export default function Footer() {
  return (
    <footer className="bg-mist text-ink">
      <Container className="pb-28 pt-14 sm:py-16">
        <div className="grid gap-10 border-b border-rule pb-12 sm:grid-cols-3">
          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[0.82rem] font-semibold tracking-[-0.01em]">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[0.82rem] leading-relaxed text-slate transition-colors duration-300 hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-b border-rule py-10">
          <h3 className="text-[0.82rem] font-semibold tracking-[-0.01em]">Areas we serve</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {AREAS_SERVED.map((area) => (
              <li
                key={area}
                className="rounded-pill border border-rule px-3 py-1.5 text-[0.75rem] leading-none text-slate"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-8 border-b border-rule py-12 sm:grid-cols-3">
          {OFFICES.map((o) => (
            <div key={o.city}>
              <h3 className="text-[0.82rem] font-semibold">{o.city}</h3>
              <p className="mt-3 text-[0.82rem] leading-relaxed text-slate">
                {o.lines[0]}
                <br />
                {o.lines[1]}
                <br />
                <span className="num">{o.tel}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-8 text-[0.75rem] leading-relaxed text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © {new Date().getFullYear()} Vensam Properties. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="transition-colors hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-ink">
              Terms
            </Link>
            <CookieSettingsButton className="transition-colors hover:text-ink" />
            <Link href="/about" className="transition-colors hover:text-ink">
              Regulatory
            </Link>
            <span className="num">RICS regulated</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
