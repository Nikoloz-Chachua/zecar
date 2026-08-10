import type { MetadataRoute } from "next";
import { dealership } from "@/data/dealership";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/" }, sitemap: `${dealership.siteUrl}/sitemap.xml` }; }
