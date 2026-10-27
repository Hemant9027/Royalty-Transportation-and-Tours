import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, Manrope } from "next/font/google";
import { BUSINESS } from "@/lib/constants";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Royalty Transportation & Tours — Nassau, The Bahamas",
    template: "%s · Royalty Transportation & Tours",
  },
  description:
    "Airport transfers, private transportation, group shuttles and island tours in Nassau, The Bahamas. Demo concept experience with a working reservation-request workflow.",
  keywords: [
    "Nassau airport transfers",
    "Bahamas transportation",
    "Nassau tours",
    "group transportation Bahamas",
    "Royalty Transportation and Tours",
  ],
  openGraph: {
    title: "Royalty Transportation & Tours — Nassau, The Bahamas",
    description: "Airport transfers, private rides, group transport and island experiences in Nassau, The Bahamas.",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 2400, height: 1280, alt: "Sunlit waves breaking along a tropical shoreline" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1e32",
  width: "device-width",
  initialScale: 1,
};

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: BUSINESS.legalName,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    url: BUSINESS.website,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Buttonwood, Pinewood Gardens",
      addressLocality: "Nassau",
      addressCountry: "BS",
    },
    areaServed: ["Nassau", "Paradise Island", "Cable Beach", "New Providence"],
    description:
      "Ground transportation and tours in Nassau, The Bahamas: airport transfers with meet & greet, private rides, group transportation and island tours.",
    sameAs: [BUSINESS.website, BUSINESS.tripadvisorUrl],
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="bg-white text-navy-900 antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }} />
        {children}
      </body>
    </html>
  );
}
