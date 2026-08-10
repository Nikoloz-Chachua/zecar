import { dealership } from "@/data/dealership";
import type { Vehicle } from "@/types/vehicle";

type InquiryDetails = { name?: string; email?: string; phone?: string; message?: string };

export function buildInquiryMessage(vehicle: Vehicle) {
  return `Hello ZECAR, I’m interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Listing: ${dealership.siteUrl}/cars/${vehicle.slug}. Is it still available?`;
}

export function buildWhatsAppUrl(vehicle: Vehicle) {
  return `https://wa.me/${dealership.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(buildInquiryMessage(vehicle))}`;
}

export function buildMailtoUrl(vehicle?: Vehicle, details: InquiryDetails = {}) {
  const subject = vehicle
    ? `Inquiry: ${vehicle.year} ${vehicle.make} ${vehicle.model}`
    : "Showroom inquiry";
  const lines = [
    details.name && `Name: ${details.name}`,
    details.email && `Email: ${details.email}`,
    details.phone && `Phone: ${details.phone}`,
    vehicle && `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    vehicle && `Listing: ${dealership.siteUrl}/cars/${vehicle.slug}`,
    details.message && `Message: ${details.message}`,
  ].filter(Boolean);
  return `mailto:${dealership.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n\n"))}`;
}
