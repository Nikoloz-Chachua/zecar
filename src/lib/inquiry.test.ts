import { describe, expect, it } from "vitest";

import { dealership } from "@/data/dealership";
import { vehicles } from "@/data/vehicles";
import {
  buildInquiryMessage,
  buildMailtoUrl,
  buildWhatsAppUrl,
} from "@/lib/inquiry";
import { resolveLocalizedTitle } from "@/lib/page-title";

describe("exact-vehicle inquiry helpers", () => {
  const vehicle = vehicles[0];

  it("names the exact vehicle and listing URL in its inquiry message", () => {
    const message = buildInquiryMessage(vehicle);

    expect(message).toContain(`${vehicle.make} ${vehicle.model}`);
    expect(message).toContain(`/cars/${vehicle.slug}`);
  });

  it("uses the supplied Hyundai year in inquiries and page titles", () => {
    const santaFe = vehicles.find(({ slug }) => slug === "hyundai-santa-fe-2-0t")!;
    expect(buildInquiryMessage(santaFe)).toContain("Hyundai Santa Fe 2.0T");
    expect(buildInquiryMessage(santaFe)).toContain("2018 Hyundai Santa Fe 2.0T");
    expect(buildInquiryMessage(santaFe)).not.toMatch(/null|undefined/);
    expect(resolveLocalizedTitle(`/cars/${santaFe.slug}`, "en")).toBe("2018 Hyundai Santa Fe 2.0T | ZECAR");
  });

  it("uses the updated Lexus model and year in inquiries and page titles", () => {
    const lexus = vehicles.find(({ slug }) => slug === "lexus-nx-200t")!;
    expect(buildInquiryMessage(lexus)).toContain("2016 Lexus NX 200 F Sport");
    expect(resolveLocalizedTitle(`/cars/${lexus.slug}`, "en")).toBe("2016 Lexus NX 200 F Sport | ZECAR");
  });

  it("identifies a vehicle with its supplied year", () => {
    const message = buildInquiryMessage(vehicle);
    expect(message).toContain(`${vehicle.make} ${vehicle.model}`);
    expect(message).not.toContain("null");
    expect(message).not.toContain("undefined");
    expect(resolveLocalizedTitle(`/cars/${vehicle.slug}`, "en")).toBe(
      `${vehicle.year} ${vehicle.make} ${vehicle.model} | ZECAR`,
    );
  });

  it("creates an encoded WhatsApp URL for the configured dealership number", () => {
    const url = buildWhatsAppUrl(vehicle);

    expect(url).toContain(`wa.me/${dealership.whatsapp.replace(/\D/g, "")}`);
    expect(decodeURIComponent(url)).toContain(vehicle.model);
  });

  it("creates a transparent mailto inquiry for the exact vehicle", () => {
    const url = buildMailtoUrl(vehicle, {
      name: "Alex Morgan",
      email: "alex@example.com",
      phone: "+1 555 0100",
      message: "Please confirm availability.",
    });

    expect(url).toMatch(/^mailto:nikoloz\.chachua10@gmail\.com\?/);
    expect(decodeURIComponent(url)).toContain(vehicle.slug);
    expect(decodeURIComponent(url)).toContain("Alex Morgan");
    expect(decodeURIComponent(url)).toContain("Please confirm availability.");
  });
});
