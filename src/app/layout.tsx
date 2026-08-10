import type { Metadata } from "next";
import { Manrope, Noto_Sans_Georgian } from "next/font/google";
import { dealership } from "@/data/dealership";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LocalizedSkipLink, LocaleTitleSync } from "@/components/locale-document";
import { LocaleProvider } from "@/components/locale-provider";
import { dictionaries } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "cyrillic"], display: "swap" });
const notoSansGeorgian = Noto_Sans_Georgian({ variable: "--font-georgian", subsets: ["georgian"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(dealership.siteUrl),
  title: { default: `${dealership.name} — პრემიუმ მეორადი ავტომობილები`, template: `%s | ${dealership.name}` },
  description: dictionaries.ka.dealership.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: dealership.name, title: dictionaries.ka.dealership.tagline, description: dictionaries.ka.dealership.description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = { "@context": "https://schema.org", "@type": "AutoDealer", name: dealership.name, url: dealership.siteUrl, telephone: dealership.phone, email: dealership.email, description: dictionaries.ka.dealership.description, address: { "@type": "PostalAddress", streetAddress: dealership.address } };
  return <html lang="ka" className={`${manrope.variable} ${notoSansGeorgian.variable}`}><body><LocaleProvider><LocalizedSkipLink /><LocaleTitleSync /><Header /><main id="main">{children}</main><Footer /></LocaleProvider><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /></body></html>;
}
