"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dealership } from "@/data/dealership";
import { locales } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { Close, Phone } from "./icons";

export function LanguageSwitcher() {
  const { locale, setLocale, dictionary: t } = useLocale();
  return <div className="language-switcher" role="group" aria-label={t.nav.language}>{locales.map((item) => <button key={item} type="button" onClick={() => setLocale(item)} aria-pressed={locale === item} aria-label={t.localeNames[item]} lang={item}>{item.toUpperCase()}</button>)}</div>;
}
export function Header() {
  const [open, setOpen] = useState(false); const pathname = usePathname(); const { dictionary: t } = useLocale();
  const navigation = [{ href: "/", label: t.nav.home }, { href: "/cars", label: t.nav.cars }, { href: "/about", label: t.nav.about }, { href: "/contact", label: t.nav.contact }];
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return <header className="site-header"><div className="shell header-inner"><Link href="/" className="brand" aria-label={t.nav.brandHome}>ZE<span>CAR</span></Link><nav className="desktop-nav" aria-label={t.nav.primary}>{navigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}</nav><div className="header-tools"><LanguageSwitcher/><a className="header-call" href={`tel:${dealership.phoneHref}`}><Phone className="icon" /> {dealership.phone}</a></div><button className="menu-button" type="button" aria-label={open ? t.nav.closeMenu : t.nav.openMenu} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <Close className="icon" /> : <><span /><span /></>}</button></div>{open && <div className="mobile-nav-wrap" id="mobile-menu"><nav className="mobile-nav shell" aria-label={t.nav.mobile}>{navigation.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{item.label}</Link>)}<a className="button primary" href={`tel:${dealership.phoneHref}`}><Phone className="icon" /> {t.nav.callShowroom}</a></nav></div>}</header>;
}
