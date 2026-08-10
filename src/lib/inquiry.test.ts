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

  it("identifies a pending-details vehicle without adding a missing year", () => {
    const message = buildInquiryMessage(vehicle);
    expect(message).toContain(`${vehicle.make} ${vehicle.model}`);
    expect(message).not.toContain("null");
    expect(message).not.toContain("undefined");
    expect(resolveLocalizedTitle(`/cars/${vehicle.slug}`, "en")).toBe(
      `${vehicle.make} ${vehicle.model} | ZECAR`,
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

    expect(url).toMatch(/^mailto:/);
    expect(decodeURIComponent(url)).toContain(vehicle.slug);
    expect(decodeURIComponent(url)).toContain("Alex Morgan");
    expect(decodeURIComponent(url)).toContain("Please confirm availability.");
  });
});
