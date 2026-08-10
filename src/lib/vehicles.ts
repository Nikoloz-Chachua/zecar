import { vehicles } from "@/data/vehicles";
import type { Currency, Vehicle, VehicleFilters, VehicleSort } from "@/types/vehicle";

export function filterVehicles(items: Vehicle[], filters: VehicleFilters): Vehicle[] {
  const search = filters.search?.trim().toLowerCase();
  return items.filter((vehicle) => {
    const haystack = `${vehicle.make} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ""}`.toLowerCase();
    return (!search || search.split(/\s+/).every((term) => haystack.includes(term))) &&
      (!filters.make || vehicle.make === filters.make) &&
      (!filters.yearMin || (vehicle.year !== null && vehicle.year >= filters.yearMin)) &&
      (!filters.priceMax || (vehicle.price !== null && vehicle.price <= filters.priceMax)) &&
      (!filters.mileageMax || (vehicle.mileage !== null && vehicle.mileage <= filters.mileageMax)) &&
      (!filters.fuelType || vehicle.fuelType === filters.fuelType) &&
      (!filters.transmission || vehicle.transmission === filters.transmission) &&
      (!filters.bodyType || vehicle.bodyType === filters.bodyType) &&
      (!filters.availabilityStatus || vehicle.availabilityStatus === filters.availabilityStatus);
  });
}

export function sortVehicles(items: Vehicle[], sort: VehicleSort): Vehicle[] {
  const copy = [...items];
  const nullableNumber = (selector: (vehicle: Vehicle) => number | null, direction: 1 | -1) =>
    (a: Vehicle, b: Vehicle) => {
      const aValue = selector(a); const bValue = selector(b);
      if (aValue === null) return bValue === null ? 0 : 1;
      if (bValue === null) return -1;
      return (aValue - bValue) * direction;
    };
  const comparators: Record<VehicleSort, (a: Vehicle, b: Vehicle) => number> = {
    newest: (a, b) => b.createdDate.localeCompare(a.createdDate),
    "price-asc": nullableNumber((vehicle) => vehicle.price, 1),
    "price-desc": nullableNumber((vehicle) => vehicle.price, -1),
    "year-newest": (a, b) => nullableNumber((vehicle) => vehicle.year, -1)(a, b) || b.createdDate.localeCompare(a.createdDate),
    "mileage-lowest": nullableNumber((vehicle) => vehicle.mileage, 1),
  };
  return copy.sort(comparators[sort]);
}

export const formatCurrency = (value: number, currency: Currency) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export const formatMileage = (mileage: number, locale = "en", unit = "mi") => `${new Intl.NumberFormat(locale === "ka" ? "ka-GE" : locale === "ru" ? "ru-RU" : "en-US").format(mileage)} ${unit}`;
export const getVehicleBySlug = (slug: string) => vehicles.find((vehicle) => vehicle.slug === slug);
export const getVehicleTitle = (vehicle: Pick<Vehicle, "year" | "make" | "model">) =>
  [vehicle.year, vehicle.make, vehicle.model].filter((part) => part !== null).join(" ");
export const getSimilarVehicles = (vehicle: Vehicle, limit = 3) => {
  const candidates = vehicles.filter((item) => item.id !== vehicle.id);
  const closeMatches = candidates.filter(
    (item) => item.bodyType === vehicle.bodyType || item.make === vehicle.make,
  );
  const fallback = candidates.filter(
    (item) => !closeMatches.some((match) => match.id === item.id),
  );
  return [...closeMatches, ...fallback].slice(0, limit);
};
