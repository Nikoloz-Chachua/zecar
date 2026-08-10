"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dealership, navigation } from "@/data/dealership";
import { Close, Phone } from "./icons";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return <header className="site-header">
    <div className="shell header-inner">
      <Link href="/" className="brand" aria-label="ZECAR home">ZE<span>CAR</span></Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <a className="header-call" href={`tel:${dealership.phoneHref}`}><Phone className="icon" /> {dealership.phone}</a>
      <button className="menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
        {open ? <Close className="icon" /> : <><span /><span /></>}
      </button>
    </div>
    {open && <div className="mobile-nav-wrap" id="mobile-menu"><nav className="mobile-nav shell" aria-label="Mobile navigation">
        {navigation.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{item.label}</Link>)}
      <a className="button primary" href={`tel:${dealership.phoneHref}`}><Phone className="icon" /> Call showroom</a>
    </nav></div>}
  </header>;
}
