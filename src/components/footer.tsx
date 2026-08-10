"use client";
import Image from "next/image";
import Link from "next/link";
import { dealership } from "@/data/dealership";
import { useLocale } from "./locale-provider";

export function Footer() { const { dictionary: t } = useLocale(); const nav = [["/",t.nav.home],["/cars",t.nav.cars],["/about",t.nav.about],["/contact",t.nav.contact]]; return <footer className="footer"><div className="shell footer-grid"><div><Link href="/" className="brand-link"><span className="brand-lockup light"><Image src="/brand/zecar-mark.png" alt="" width={24} height={38}/><span className="brand light">ZE<span>CAR</span></span></span></Link><p>{t.dealership.tagline}</p></div><div><h2>{t.footer.explore}</h2>{nav.map(([href,label]) => <Link key={href} href={href}>{label}</Link>)}</div><div><h2>{t.footer.contact}</h2><a href={`tel:${dealership.phoneHref}`}>{dealership.phone}</a><a href={`mailto:${dealership.email}`}>{dealership.email}</a><p>{t.dealership.address}</p></div><div><h2>{t.footer.hours}</h2>{t.dealership.hours.map((hour) => <p key={hour}>{hour}</p>)}</div></div><div className="shell footer-bottom"><p>© {new Date().getFullYear()} {dealership.name}. {t.footer.copyright}</p><p>{t.footer.demo}</p></div></footer>; }
