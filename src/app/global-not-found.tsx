import type { Metadata } from "next"; import { Manrope,Noto_Sans_Georgian } from "next/font/google"; import { PublicShell } from "@/components/public-shell"; import { NotFoundView } from "@/components/localized-pages"; import "./globals.css";
const manrope=Manrope({variable:"--font-manrope",subsets:["latin","cyrillic"],display:"swap"});const georgian=Noto_Sans_Georgian({variable:"--font-georgian",subsets:["georgian"],display:"swap"});
export const metadata:Metadata={title:"გვერდი ვერ მოიძებნა | ZECAR",robots:{index:false,follow:false}};
export default function GlobalNotFound(){return <html lang="ka" className={`${manrope.variable} ${georgian.variable}`}><body><PublicShell><NotFoundView/></PublicShell></body></html>}
