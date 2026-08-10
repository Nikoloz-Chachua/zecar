import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

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
  it("maps the supplied catalogue to the correct identities and clean slugs", () => {
    expect(vehicles.slice(0, 4).map(({ id, make, model, slug }) => ({ id, make, model, slug }))).toEqual([
      { id: "zec-001", make: "Chevrolet", model: "Trailblazer RS", slug: "chevrolet-trailblazer-rs" },
      { id: "zec-002", make: "Lexus", model: "NX 200t", slug: "lexus-nx-200t" },
      { id: "zec-003", make: "Nissan", model: "Kicks SR", slug: "nissan-kicks-sr" },
      { id: "zec-004", make: "Kia", model: "Soul", slug: "kia-soul" },
    ]);
    expect(vehicles.slice(0, 4).flatMap((vehicle) => vehicle.galleryImages)).toSatisfy(
      (paths: string[]) => paths.every((path) => path.startsWith("/vehicles/")),
    );
  });

  it("uses each cover first, exact gallery counts, and a separate local hero image", () => {
    expect(vehicles.slice(0, 4).map((vehicle) => vehicle.galleryImages.length)).toEqual([4, 4, 4, 3]);
    expect(vehicles.slice(0, 4).every((vehicle) => vehicle.coverImage === vehicle.galleryImages[0])).toBe(true);
    expect(vehicles[0].heroImage).toBe("/vehicles/trailblazer/hero.webp");
    expect(vehicles[0].heroImage).not.toBe(vehicles[0].coverImage);
  });

  it("keeps pending values out of active filters and after known values when sorting", () => {
    const pending = vehicles[0];
    expect(pending.year).toBeNull();
    expect(pending.price).toBeNull();
    expect(pending.mileage).toBeNull();
    expect(pending.fuelType).toBeNull();
    expect(pending.transmission).toBeNull();
    expect(filterVehicles([pending], { yearMin: 2000 })).toEqual([]);
    expect(filterVehicles([pending], { priceMax: 999999 })).toEqual([]);
    expect(filterVehicles([pending], { mileageMax: 999999 })).toEqual([]);
    expect(filterVehicles([pending], { fuelType: "Petrol" })).toEqual([]);
    expect(filterVehicles([pending], { transmission: "Automatic" })).toEqual([]);

    const known = vehicles[4];
    for (const sort of ["price-asc", "price-desc", "year-newest", "mileage-lowest"] as const) {
      expect(sortVehicles([pending, known], sort).at(-1)?.id).toBe(pending.id);
    }
  });

  it("references vehicle, brand, and metadata image paths that exist locally", () => {
    const paths = [
      "/brand/zecar-mark.png",
      "/src/app/icon.png",
      "/src/app/apple-icon.png",
      vehicles[0].heroImage!,
      ...vehicles.slice(0, 4).flatMap((vehicle) => [vehicle.coverImage, ...vehicle.galleryImages]),
    ];
    for (const path of paths) {
      const repositoryPath = path.startsWith("/src/") ? path.slice(1) : `public${path}`;
      expect(existsSync(join(process.cwd(), repositoryPath)), repositoryPath).toBe(true);
    }
  });
  it("filters across search, practical facets, and numeric ranges", () => {
    const result = filterVehicles(vehicles, {
      search: "audi e-tron",
      make: "Audi",
      yearMin: 2022,
      priceMax: 100000,
      mileageMax: 30000,
      fuelType: "Electric",
      transmission: "Automatic",
      bodyType: "Sedan",
      availabilityStatus: "Available",
    });

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("2023-audi-e-tron-gt");
  });

  it("matches a model-only search case-insensitively", () => {
    expect(filterVehicles(vehicles, { search: "defender 110" })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "2022-land-rover-defender-110" }),
      ]),
    );
  });

  it("sorts by price, year, mileage, and newest listing date", () => {
    expect(sortVehicles(vehicles, "price-asc")[0].slug).toBe(
      "2022-land-rover-defender-110",
    );
    expect(sortVehicles(vehicles, "price-desc")[0].slug).toBe(
      "2023-audi-e-tron-gt",
    );
    expect(sortVehicles(vehicles, "year-newest")[0].year).toBe(2023);
    expect(sortVehicles(vehicles, "mileage-lowest")[0].mileage).toBe(9800);
    expect(sortVehicles(vehicles, "newest")[0].createdDate).toBe("2026-08-10");
  });

  it("formats prices and mileage for display", () => {
    expect(formatCurrency(68900, "USD")).toBe("$68,900");
    expect(formatMileage(12450)).toBe("12,450 mi");
  });

  it("always returns more inventory when close matches are limited", () => {
    const porsche = getVehicleBySlug("chevrolet-trailblazer-rs");
    expect(porsche).toBeDefined();

    const similar = getSimilarVehicles(porsche!, 3);
    expect(similar).toHaveLength(3);
    expect(similar.every((vehicle) => vehicle.id !== porsche!.id)).toBe(true);
  });

  it("looks up a vehicle by exact slug", () => {
    expect(getVehicleBySlug("chevrolet-trailblazer-rs")?.make).toBe("Chevrolet");
    expect(getVehicleBySlug("missing-listing")).toBeUndefined();
  });
});
