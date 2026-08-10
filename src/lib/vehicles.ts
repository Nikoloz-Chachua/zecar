import { vehicles } from "@/data/vehicles";
import type { Currency, Vehicle, VehicleFilters, VehicleSort } from "@/types/vehicle";

export function filterVehicles(items: Vehicle[], filters: VehicleFilters): Vehicle[] {
  const search = filters.search?.trim().toLowerCase();
  return items.filter((vehicle) => {
    const haystack = `${vehicle.make} ${vehicle.model} ${vehicle.year}`.toLowerCase();
    return (!search || search.split(/\s+/).every((term) => haystack.includes(term))) &&
      (!filters.make || vehicle.make === filters.make) &&
      (!filters.yearMin || vehicle.year >= filters.yearMin) &&
      (!filters.priceMax || vehicle.price <= filters.priceMax) &&
      (!filters.mileageMax || vehicle.mileage <= filters.mileageMax) &&
      (!filters.fuelType || vehicle.fuelType === filters.fuelType) &&
      (!filters.transmission || vehicle.transmission === filters.transmission) &&
      (!filters.bodyType || vehicle.bodyType === filters.bodyType) &&
      (!filters.availabilityStatus || vehicle.availabilityStatus === filters.availabilityStatus);
  });
}

export function sortVehicles(items: Vehicle[], sort: VehicleSort): Vehicle[] {
  const copy = [...items];
  const comparators: Record<VehicleSort, (a: Vehicle, b: Vehicle) => number> = {
    newest: (a, b) => b.createdDate.localeCompare(a.createdDate),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "year-newest": (a, b) => b.year - a.year || b.createdDate.localeCompare(a.createdDate),
    "mileage-lowest": (a, b) => a.mileage - b.mileage,
  };
  return copy.sort(comparators[sort]);
}

export const formatCurrency = (value: number, currency: Currency) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export const formatMileage = (mileage: number) => `${new Intl.NumberFormat("en-US").format(mileage)} mi`;
export const getVehicleBySlug = (slug: string) => vehicles.find((vehicle) => vehicle.slug === slug);
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
