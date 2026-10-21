import Link from "next/link";
import { Container } from "./ui";
// import CookieSettingsButton from "./cookie-settings-button"; — cookies commented out
import { AREAS_SERVED } from "@/lib/data";
import { getProperties } from "@/lib/server-api";

const COLS = [
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

export default async function Footer() {
  // Top three regions by property count — recomputed whenever pages render
  // and refreshed automatically after any admin catalogue change (the admin
  // console pings /api/revalidate, which revalidates the whole tree).
  const properties = await getProperties();
  const counts = new Map<string, number>();
  for (const p of properties) {
    const region = (p.region ?? "").trim();
    if (region) counts.set(region, (counts.get(region) ?? 0) + 1);
  }
  const topRegions = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([region]) => region);

  const columns = [
    {
      title: "Residences",
      links: [
        { href: "/properties", label: "All residences" },
        { href: "/properties?status=For+Rent", label: "For rent" },
        ...topRegions.map((region) => ({
          href: `/properties?region=${encodeURIComponent(region)}`,
          label: region,
        })),
      ],
    },
    ...COLS,
  ];

  return (
    <footer className="bg-mist text-ink">
      <Container className="pb-28 pt-14 sm:py-16">
        <div className="grid gap-10 border-b border-rule pb-12 sm:grid-cols-3">
          {columns.map((col) => (
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
            {/* <CookieSettingsButton className="transition-colors hover:text-ink" /> — commented out */}
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
