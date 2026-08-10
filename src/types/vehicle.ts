export type AvailabilityStatus = "Available" | "Reserved" | "Recently Sold";
export type Currency = "USD" | "EUR";

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number | null;
  price: number | null;
  currency: Currency;
  mileage: number | null;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric" | null;
  transmission: "Automatic" | "Manual" | null;
  engine: string | null;
  bodyType: "SUV" | "Sedan" | "Coupe" | "Wagon";
  drivetrain: "FWD" | "RWD" | "AWD" | null;
  exteriorColor: string;
  interiorColor: string | null;
  condition: "Pre-owned";
  description: string;
  features: string[];
  coverImage: string;
  galleryImages: string[];
  heroImage?: string;
  availabilityStatus: AvailabilityStatus;
  featured: boolean;
  createdDate: string;
  location: string;
}

export type VehicleSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "year-newest"
  | "mileage-lowest";

export interface VehicleFilters {
  search?: string;
  make?: string;
  yearMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuelType?: NonNullable<Vehicle["fuelType"]> | "";
  transmission?: NonNullable<Vehicle["transmission"]> | "";
  bodyType?: Vehicle["bodyType"] | "";
  availabilityStatus?: AvailabilityStatus | "";
}
