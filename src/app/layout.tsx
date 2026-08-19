import type { Metadata } from "next";
import { Manrope, Noto_Sans_Georgian } from "next/font/google";
import { dealership } from "@/data/dealership";
import { dictionaries } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "cyrillic"], display: "swap" });
const notoSansGeorgian = Noto_Sans_Georgian({ variable: "--font-georgian", subsets: ["georgian"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(dealership.siteUrl),
  title: { default: `${dealership.name} — პრემიუმ მეორადი ავტომობილები`, template: `%s | ${dealership.name}` },
  description: dictionaries.ka.dealership.description,
  verification: { google: "e17LNbRKWUyrWSbiP2zxttA2NonuDIc9FaZoaeSEJKY" },
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: dealership.name, title: dictionaries.ka.dealership.tagline, description: dictionaries.ka.dealership.description },
};

export default function RootLayout({ children }: LayoutProps<"/">) { return <html lang="ka" className={`${manrope.variable} ${notoSansGeorgian.variable}`}><body>{children}</body></html>; }
