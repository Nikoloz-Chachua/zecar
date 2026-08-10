import { describe, expect, it } from "vitest";

import { vehicles } from "@/data/vehicles";
import {
  filterVehicles,
  formatCurrency,
  formatMileage,
  getSimilarVehicles,
  getVehicleBySlug,
  sortVehicles,
} from "@/lib/vehicles";

describe("vehicle inventory helpers", () => {
  it("filters across search, practical facets, and numeric ranges", () => {
    const result = filterVehicles(vehicles, {
      search: "volvo xc90",
      make: "Volvo",
      yearMin: 2022,
      priceMax: 70000,
      mileageMax: 30000,
      fuelType: "Hybrid",
      transmission: "Automatic",
      bodyType: "SUV",
      availabilityStatus: "Available",
    });

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("2023-volvo-xc90-recharge");
  });

  it("matches a model-only search case-insensitively", () => {
    expect(filterVehicles(vehicles, { search: "m3 competition" })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "2022-bmw-m3-competition" }),
      ]),
    );
  });

  it("sorts by price, year, mileage, and newest listing date", () => {
    expect(sortVehicles(vehicles, "price-asc")[0].slug).toBe(
      "2021-mercedes-benz-e450",
    );
    expect(sortVehicles(vehicles, "price-desc")[0].slug).toBe(
      "2024-porsche-911-carrera",
    );
    expect(sortVehicles(vehicles, "year-newest")[0].year).toBe(2024);
    expect(sortVehicles(vehicles, "mileage-lowest")[0].mileage).toBe(4200);
    expect(sortVehicles(vehicles, "newest")[0].createdDate).toBe("2026-07-28");
  });

  it("formats prices and mileage for display", () => {
    expect(formatCurrency(68900, "USD")).toBe("$68,900");
    expect(formatMileage(12450)).toBe("12,450 mi");
  });

  it("always returns more inventory when close matches are limited", () => {
    const porsche = getVehicleBySlug("2024-porsche-911-carrera");
    expect(porsche).toBeDefined();

    const similar = getSimilarVehicles(porsche!, 3);
    expect(similar).toHaveLength(3);
    expect(similar.every((vehicle) => vehicle.id !== porsche!.id)).toBe(true);
  });

  it("looks up a vehicle by exact slug", () => {
    expect(getVehicleBySlug("2024-porsche-911-carrera")?.make).toBe("Porsche");
    expect(getVehicleBySlug("missing-listing")).toBeUndefined();
  });
});
