import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { Arrow, Check, Message, Phone } from "@/components/icons";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { dealership } from "@/data/dealership";
import { vehicles } from "@/data/vehicles";
import { buildWhatsAppUrl } from "@/lib/inquiry";
import { formatCurrency, formatMileage, getSimilarVehicles, getVehicleBySlug } from "@/lib/vehicles";

export function generateStaticParams() { return vehicles.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: PageProps<"/cars/[slug]">): Promise<Metadata> {
  const vehicle = getVehicleBySlug((await params).slug);
  if (!vehicle) return { title: "Vehicle not found" };
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  return { title, description: `${formatMileage(vehicle.mileage)}, ${vehicle.fuelType}, ${vehicle.transmission}. View photos and details for this ${title}.`, alternates: { canonical: `/cars/${vehicle.slug}` }, openGraph: { title, description: vehicle.description, images: [{ url: vehicle.coverImage, alt: title }] } };
}

export default async function VehiclePage({ params }: PageProps<"/cars/[slug]">) {
  const vehicle = getVehicleBySlug((await params).slug); if (!vehicle) notFound();
  const specs = [["Mileage", formatMileage(vehicle.mileage)], ["Fuel", vehicle.fuelType], ["Transmission", vehicle.transmission], ["Engine", vehicle.engine], ["Body", vehicle.bodyType], ["Drivetrain", vehicle.drivetrain], ["Exterior", vehicle.exteriorColor], ["Interior", vehicle.interiorColor], ["Location", vehicle.location]];
  const similar = getSimilarVehicles(vehicle);
  const jsonLd = { "@context": "https://schema.org", "@type": "Vehicle", name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, image: vehicle.galleryImages, description: vehicle.description, vehicleModelDate: String(vehicle.year), manufacturer: { "@type": "Organization", name: vehicle.make }, model: vehicle.model, mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "SMI" }, fuelType: vehicle.fuelType, vehicleTransmission: vehicle.transmission, color: vehicle.exteriorColor, offers: { "@type": "Offer", price: vehicle.price, priceCurrency: vehicle.currency, availability: vehicle.availabilityStatus === "Available" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability", url: `${dealership.siteUrl}/cars/${vehicle.slug}` } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><section className="detail-top shell"><div className="breadcrumbs"><Link href="/cars">Cars</Link><span>/</span><span>{vehicle.make} {vehicle.model}</span></div><div className="detail-title"><div><p className="eyebrow">{vehicle.year} · {vehicle.condition}</p><h1>{vehicle.make} {vehicle.model}</h1></div><div><span className={`status ${vehicle.availabilityStatus.toLowerCase().replace(" ", "-")}`}>{vehicle.availabilityStatus}</span><strong>{formatCurrency(vehicle.price, vehicle.currency)}</strong></div></div><VehicleGallery vehicle={vehicle} /></section><section className="shell detail-layout"><div className="detail-content"><div className="spec-grid">{specs.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="detail-block"><p className="eyebrow">About this car</p><h2>Overview</h2><p>{vehicle.description}</p></div><div className="detail-block"><p className="eyebrow">Equipment</p><h2>Key features</h2><ul className="features">{vehicle.features.map((feature) => <li key={feature}><Check className="icon" />{feature}</li>)}</ul></div></div><aside className="inquiry-card"><p className="eyebrow">Interested in this car?</p><h2>Ask about the {vehicle.model}.</h2><p>Contact the showroom directly. Your message will reference this exact listing.</p><a className="button primary full" href={`tel:${dealership.phoneHref}`}><Phone className="icon" /> Call {dealership.phone}</a><a className="button whatsapp full" href={buildWhatsAppUrl(vehicle)} target="_blank" rel="noreferrer"><Message className="icon" /> WhatsApp inquiry</a><details><summary>Email inquiry <Arrow className="icon" /></summary><ContactForm vehicle={vehicle} /></details></aside></section>{similar.length > 0 && <section className="section shell similar"><div className="split-heading"><div><p className="eyebrow">Keep looking</p><h2>Similar vehicles.</h2></div><Link className="text-link" href="/cars">All cars <Arrow className="icon" /></Link></div><div className="three-grid">{similar.map((item) => <VehicleCard key={item.id} vehicle={item} />)}</div></section>}</>;
}
