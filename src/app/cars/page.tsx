import type { Metadata } from "next";
import { Suspense } from "react";
import { InventoryBrowser } from "@/components/inventory-browser";

export const metadata: Metadata = { title: "Cars", description: "Browse ZECAR's sample premium pre-owned vehicle inventory.", alternates: { canonical: "/cars" } };
export default function CarsPage() { return <><section className="page-intro shell"><p className="eyebrow">Current selection</p><h1>Find your next car.</h1><p>Search, filter, and compare our carefully presented sample inventory.</p></section><div className="shell inventory-section"><Suspense fallback={<p>Loading inventory…</p>}><InventoryBrowser /></Suspense></div></>; }
