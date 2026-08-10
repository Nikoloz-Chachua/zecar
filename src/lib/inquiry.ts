import { dealership } from "@/data/dealership";
import { DEFAULT_LOCALE, dictionaries, type Locale } from "@/lib/i18n";
import type { Vehicle } from "@/types/vehicle";
import { getVehicleTitle } from "@/lib/vehicles";

type InquiryDetails = { name?: string; email?: string; phone?: string; message?: string };

export function buildInquiryMessage(vehicle: Vehicle, locale: Locale = DEFAULT_LOCALE) {
  const t = dictionaries[locale].inquiry;
  return `${t.greeting} ${getVehicleTitle(vehicle)}. ${t.listing}: ${dealership.siteUrl}/cars/${vehicle.slug}. ${t.availableQuestion}`;
}

export function buildWhatsAppUrl(vehicle: Vehicle, locale: Locale = DEFAULT_LOCALE) {
  return `https://wa.me/${dealership.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(buildInquiryMessage(vehicle, locale))}`;
}

export function buildMailtoUrl(vehicle?: Vehicle, details: InquiryDetails = {}, locale: Locale = DEFAULT_LOCALE) {
  const t = dictionaries[locale].inquiry;
  const subject = vehicle
    ? `${t.subjectVehicle}: ${getVehicleTitle(vehicle)}`
    : t.subjectShowroom;
  const lines = [
    details.name && `${t.name}: ${details.name}`,
    details.email && `${t.email}: ${details.email}`,
    details.phone && `${t.phone}: ${details.phone}`,
    vehicle && `${t.vehicle}: ${getVehicleTitle(vehicle)}`,
    vehicle && `${t.listing}: ${dealership.siteUrl}/cars/${vehicle.slug}`,
    details.message && `${t.message}: ${details.message}`,
  ].filter(Boolean);
  return `mailto:${dealership.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n\n"))}`;
}
