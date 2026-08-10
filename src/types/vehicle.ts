export type AvailabilityStatus = "Available" | "Reserved" | "Recently Sold";
export type Currency = "USD" | "EUR";

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: Currency;
  mileage: number;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  transmission: "Automatic" | "Manual";
  engine: string;
  bodyType: "SUV" | "Sedan" | "Coupe" | "Wagon";
  drivetrain: "FWD" | "RWD" | "AWD";
  exteriorColor: string;
  interiorColor: string;
  condition: "Pre-owned";
  description: string;
  features: string[];
  coverImage: string;
  galleryImages: string[];
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
  fuelType?: Vehicle["fuelType"] | "";
  transmission?: Vehicle["transmission"] | "";
  bodyType?: Vehicle["bodyType"] | "";
  availabilityStatus?: AvailabilityStatus | "";
}
