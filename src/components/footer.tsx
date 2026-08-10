import Link from "next/link";
import { dealership, navigation } from "@/data/dealership";

export function Footer() {
  return <footer className="footer"><div className="shell footer-grid">
    <div><Link href="/" className="brand light">ZE<span>CAR</span></Link><p>{dealership.tagline}</p></div>
    <div><h2>Explore</h2>{navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
    <div><h2>Contact</h2><a href={`tel:${dealership.phoneHref}`}>{dealership.phone}</a><a href={`mailto:${dealership.email}`}>{dealership.email}</a><p>{dealership.address}</p></div>
    <div><h2>Opening hours</h2>{dealership.hours.map((hour) => <p key={hour}>{hour}</p>)}</div>
  </div><div className="shell footer-bottom"><p>© {new Date().getFullYear()} {dealership.name}. Sample showroom experience.</p><p>Inventory shown is demonstration content.</p></div></footer>;
}
