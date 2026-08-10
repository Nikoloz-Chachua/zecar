import Link from "next/link";
import { Arrow } from "@/components/icons";
export default function NotFound() { return <section className="not-found shell"><p className="eyebrow">404 · Not found</p><h1>This road ends here.</h1><p>The page or vehicle you’re looking for may have moved or is no longer listed.</p><div><Link className="button primary" href="/cars">Browse cars <Arrow className="icon" /></Link><Link className="button outline" href="/">Return home</Link></div></section>; }
