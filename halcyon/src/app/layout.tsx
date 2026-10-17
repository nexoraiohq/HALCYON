import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import RevealObserver from "@/components/reveal-observer";
import CookieConsent from "@/components/cookie-consent";
import SiteChrome from "@/components/site-chrome";
import AuthProvider from "@/components/auth/auth-context";
import AuthModal from "@/components/auth/auth-modal";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const SITE = "https://www.halcyon.estate";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Halcyon — Private Real Estate Advisory",
    template: "%s — Halcyon",
  },
  description:
    "Halcyon advises on the world's most considered private residences. Off-market acquisition, discreet sale and portfolio advisory across 41 countries since 2009.",
  keywords: [
    "private real estate",
    "luxury homes",
    "off-market property",
    "prime property advisory",
    "architectural homes",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE,
    siteName: "Halcyon Private Real Estate",
    title: "Halcyon — Private Real Estate Advisory",
    description:
      "Off-market acquisition, discreet sale and portfolio advisory across 41 countries since 2009.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Halcyon — Private Real Estate Advisory",
    description:
      "Off-market acquisition, discreet sale and portfolio advisory across 41 countries since 2009.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: "/" },
  category: "Real Estate",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": `${SITE}/#organization`,
      name: "Halcyon Private Real Estate",
      url: SITE,
      logo: `${SITE}/icon.png`,
      foundingDate: "2009",
      slogan: "Places that outlive us.",
      description:
        "Private real estate advisory specialising in off-market acquisition, discreet sale and portfolio strategy.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "18 Belgrave Mews",
        addressLocality: "London",
        postalCode: "SW1X 8RS",
        addressCountry: "GB",
      },
      telephone: "+44 20 7946 0100",
      areaServed: "Worldwide",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "Halcyon Private Real Estate",
      publisher: { "@id": `${SITE}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. ColorZilla's
    // cz-shortcut-listen) inject attributes onto <html>/<body> before React
    // hydrates — attribute-only diffs on these two nodes are safe to ignore.
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <SiteChrome header={<Header />} footer={<Footer />} consent={<CookieConsent />}>
            {children}
          </SiteChrome>
          <AuthModal />
        </AuthProvider>
        <RevealObserver />
      </body>
    </html>
  );
}
