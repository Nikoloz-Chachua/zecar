import { describe, expect, it } from "vitest";

import { vehicles } from "@/data/vehicles";
import {
  DEFAULT_LOCALE,
  dictionaries,
  getDictionary,
  isLocale,
  localizedVehicles,
  type Locale,
} from "@/lib/i18n";
import { buildInquiryMessage, buildMailtoUrl, buildWhatsAppUrl } from "@/lib/inquiry";
import { resolveLocalizedTitle } from "@/lib/page-title";

const locales: Locale[] = ["ka", "ru", "en"];

function keys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
}

describe("localization contract", () => {
  it("resolves localized titles for static, missing, and vehicle routes", () => {
    expect(resolveLocalizedTitle("/", "ka")).toBe("ZECAR — პრემიუმ მეორადი ავტომობილები");
    expect(resolveLocalizedTitle("/cars", "ru")).toBe("Автомобили | ZECAR");
    expect(resolveLocalizedTitle("/about/", "en")).toBe("About | ZECAR");
    expect(resolveLocalizedTitle("/contact", "ka")).toBe("კონტაქტი | ZECAR");
    expect(resolveLocalizedTitle("/cars/chevrolet-trailblazer-rs", "ru")).toBe("2021 Chevrolet Trailblazer RS | ZECAR");
    expect(resolveLocalizedTitle("/missing-page", "en")).toBe("Page not found | ZECAR");
  });

  it("validates supported locales and falls back to Georgian", () => {
    expect(DEFAULT_LOCALE).toBe("ka");
    expect(locales.every(isLocale)).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(getDictionary("invalid")).toBe(dictionaries.ka);
  });

  it("keeps identical required dictionary structure in all locales", () => {
    const expected = keys(dictionaries.ka).sort();
    for (const locale of locales) expect(keys(dictionaries[locale]).sort()).toEqual(expected);
  });

  it("provides localized BENDS credits without operating-hours content", () => {
    expect(dictionaries.en.footer.credit).toBe("Website fully built and operated by BENDS.");
    expect(dictionaries.ka.footer.credit).toBe("ვებსაიტი სრულად შექმნილია და იმართება BENDS-ის მიერ.");
    expect(dictionaries.ru.footer.credit).toBe("Веб-сайт полностью создан и управляется BENDS.");
    for (const locale of locales) {
      expect(dictionaries[locale].footer).not.toHaveProperty("hours");
      expect(dictionaries[locale].dealership).not.toHaveProperty("hours");
      expect(dictionaries[locale].contact).not.toHaveProperty("hours");
    }
  });

  it("localizes descriptions and every feature for all five supplied vehicles", () => {
    expect(vehicles).toHaveLength(5);
    for (const locale of locales) {
      expect(Object.keys(localizedVehicles[locale]).sort()).toEqual(["zec-001", "zec-002", "zec-003", "zec-004", "zec-005"]);
      for (const vehicle of vehicles) {
        const content = localizedVehicles[locale][vehicle.id];
        expect(content?.description.length).toBeGreaterThan(20);
        expect(content?.features).toHaveLength(vehicle.features.length);
        expect(content.features.every(Boolean)).toBe(true);
      }
    }
  });

  it("localizes exact-vehicle inquiry, WhatsApp, and mailto content", () => {
    const vehicle = vehicles[1];
    for (const locale of locales) {
      const message = buildInquiryMessage(vehicle, locale);
      expect(message).toContain(`${vehicle.make} ${vehicle.model}`);
      expect(message).toContain(`/cars/${vehicle.slug}`);
      expect(message).toContain(dictionaries[locale].inquiry.availableQuestion);
      expect(decodeURIComponent(buildWhatsAppUrl(vehicle, locale))).toContain(message);
      const mailto = decodeURIComponent(buildMailtoUrl(vehicle, { name: "Nino" }, locale));
      expect(mailto).toContain(vehicle.slug);
      expect(mailto).toContain(dictionaries[locale].inquiry.subjectVehicle);
    }
  });

  it("localizes the supplied Lexus facts without adding unknown details", () => {
    expect(localizedVehicles.en["zec-002"]).toMatchObject({ description: "A silver 2016 Lexus NX 200 F Sport with a 2.0L engine, 80,000 miles, and front-wheel drive.", engine: "2.0L", features: ["2.0L engine", "80,000 miles", "Front-wheel drive"] });
    expect(localizedVehicles.ka["zec-002"]).toMatchObject({ description: "ვერცხლისფერი 2016 წლის Lexus NX 200 F Sport, 2.0L ძრავით, 80,000 მილის გარბენითა და წინა წამყვანი თვლებით.", engine: "2.0L", features: ["2.0L ძრავა", "80,000 მილი", "წინა წამყვანი თვლები"] });
    expect(localizedVehicles.ru["zec-002"]).toMatchObject({ description: "Серебристый Lexus NX 200 F Sport 2016 года с двигателем 2.0L, пробегом 80 000 миль и передним приводом.", engine: "2.0L", features: ["Двигатель 2.0L", "80 000 миль", "Передний привод"] });
  });

  it("covers every canonical enum/spec/status value", () => {
    const values = {
      fuel: [...new Set(vehicles.map((v) => v.fuelType))],
      transmission: [...new Set(vehicles.map((v) => v.transmission))],
      body: [...new Set(vehicles.map((v) => v.bodyType))],
      drivetrain: [...new Set(vehicles.map((v) => v.drivetrain))],
      condition: [...new Set(vehicles.map((v) => v.condition))],
      availability: [...new Set(vehicles.map((v) => v.availabilityStatus))],
    } as const;
    for (const locale of locales) for (const [group, groupValues] of Object.entries(values)) {
      const translations = dictionaries[locale].enums[group as keyof typeof values] as Record<string, string>;
      for (const value of groupValues.filter((value): value is NonNullable<typeof value> => value !== null)) expect(translations[value], `${locale}.${group}.${value}`).toBeTruthy();
    }
  });
});
