import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { dealership } from "@/data/dealership";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(dealership.siteUrl),
  title: { default: `${dealership.name} — Premium pre-owned cars`, template: `%s | ${dealership.name}` },
  description: dealership.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: dealership.name, title: dealership.tagline, description: dealership.description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = { "@context": "https://schema.org", "@type": "AutoDealer", name: dealership.name, url: dealership.siteUrl, telephone: dealership.phone, email: dealership.email, address: { "@type": "PostalAddress", streetAddress: dealership.address } };
  return <html lang="en" className={manrope.variable}><body><a href="#main" className="skip-link">Skip to content</a><Header /><main id="main">{children}</main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /></body></html>;
}
