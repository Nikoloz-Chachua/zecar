import type { MetadataRoute } from "next";
import { dealership } from "@/data/dealership";
import { vehicles } from "@/data/vehicles";
export default function sitemap(): MetadataRoute.Sitemap { const pages = ["", "/cars", "/about", "/contact"].map((path) => ({ url: `${dealership.siteUrl}${path}`, lastModified: new Date("2026-08-10"), changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.8 })); return [...pages, ...vehicles.map((v) => ({ url: `${dealership.siteUrl}/cars/${v.slug}`, lastModified: new Date(v.createdDate), changeFrequency: "weekly" as const, priority: 0.7 }))]; }
