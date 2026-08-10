import type { Vehicle } from "@/types/vehicle";

// Replaceable sample inventory for demonstration. None of these listings represent real stock.
const img = (id: string, width = 1800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`;

export const vehicles: Vehicle[] = [
  {
    id: "zec-001", slug: "2024-porsche-911-carrera", make: "Porsche", model: "911 Carrera", year: 2024,
    price: 124900, currency: "USD", mileage: 4200, fuelType: "Petrol", transmission: "Automatic",
    engine: "3.0L twin-turbo flat-six", bodyType: "Coupe", drivetrain: "RWD", exteriorColor: "GT Silver Metallic",
    interiorColor: "Black leather", condition: "Pre-owned", availabilityStatus: "Available", featured: true,
    createdDate: "2026-07-28", location: "ZECAR Main Showroom",
    description: "A precisely specified Carrera with restrained colors and a clean, driver-focused cabin. Presented with complete visual details so you can inspect the car before arranging a visit.",
    features: ["Sport Chrono Package", "Adaptive sport seats", "LED matrix headlights", "Bose surround sound", "Front axle lift", "Surround view camera"],
    coverImage: img("1503376780353-7e6692767b70"),
    galleryImages: [img("1503376780353-7e6692767b70"), img("1544829099-b9a0c07fad1a"), img("1492144534655-ae79c964c9d7"), img("1503736334956-4c8f8e92946d")],
  },
  {
    id: "zec-002", slug: "2023-volvo-xc90-recharge", make: "Volvo", model: "XC90 Recharge", year: 2023,
    price: 68900, currency: "USD", mileage: 12450, fuelType: "Hybrid", transmission: "Automatic",
    engine: "2.0L turbo plug-in hybrid", bodyType: "SUV", drivetrain: "AWD", exteriorColor: "Denim Blue",
    interiorColor: "Blond leather", condition: "Pre-owned", availabilityStatus: "Available", featured: true,
    createdDate: "2026-07-19", location: "ZECAR Main Showroom",
    description: "A calm, spacious seven-seat SUV pairing electric commuting capability with long-distance flexibility. The light cabin and understated blue finish suit its considered character.",
    features: ["Seven seats", "Panoramic roof", "Bowers & Wilkins audio", "360° camera", "Pilot Assist", "Heated and ventilated seats"],
    coverImage: img("1619767886558-efdc259cde1a"),
    galleryImages: [img("1619767886558-efdc259cde1a"), img("1606664515524-ed2f786a0bd6"), img("1609521263047-f8f205293f24"), img("1563720223185-11003d516935")],
  },
  {
    id: "zec-003", slug: "2022-bmw-m3-competition", make: "BMW", model: "M3 Competition", year: 2022,
    price: 79900, currency: "USD", mileage: 18900, fuelType: "Petrol", transmission: "Automatic",
    engine: "3.0L twin-turbo inline-six", bodyType: "Sedan", drivetrain: "RWD", exteriorColor: "Isle of Man Green",
    interiorColor: "Merino black leather", condition: "Pre-owned", availabilityStatus: "Reserved", featured: true,
    createdDate: "2026-06-30", location: "ZECAR Main Showroom",
    description: "A vivid but thoughtfully configured M3 Competition with everyday four-door usability. Its specification balances the model’s performance focus with comfort and driver assistance.",
    features: ["M adaptive suspension", "Carbon interior trim", "Harman Kardon audio", "Parking Assistant Plus", "Head-up display", "Heated M sport seats"],
    coverImage: img("1555215695-3004980ad54e"),
    galleryImages: [img("1555215695-3004980ad54e"), img("1580273916550-e323be2ae537"), img("1556189250-72ba954cfc2b"), img("1523983388277-336a66bf9bcd")],
  },
  {
    id: "zec-004", slug: "2021-mercedes-benz-e450", make: "Mercedes-Benz", model: "E 450 4MATIC", year: 2021,
    price: 54900, currency: "USD", mileage: 26700, fuelType: "Petrol", transmission: "Automatic",
    engine: "3.0L turbo inline-six mild hybrid", bodyType: "Sedan", drivetrain: "AWD", exteriorColor: "Obsidian Black",
    interiorColor: "Macchiato Beige leather", condition: "Pre-owned", availabilityStatus: "Available", featured: false,
    createdDate: "2026-07-10", location: "ZECAR Main Showroom",
    description: "A refined all-weather executive sedan with a warm, light interior. Quiet on the road, intuitive in the cabin, and presented here with practical equipment clearly listed.",
    features: ["Burmester audio", "Driver Assistance Package", "Multibeam LED", "Panoramic roof", "Surround view camera", "Heated front seats"],
    coverImage: img("1618843479313-40f8afb4b4d8"),
    galleryImages: [img("1618843479313-40f8afb4b4d8"), img("1563720223185-11003d516935"), img("1617469767053-d3b523a0b982"), img("1553440569-bcc63803a83d")],
  },
  {
    id: "zec-005", slug: "2023-audi-e-tron-gt", make: "Audi", model: "e-tron GT", year: 2023,
    price: 89900, currency: "USD", mileage: 9800, fuelType: "Electric", transmission: "Automatic",
    engine: "Dual electric motors", bodyType: "Sedan", drivetrain: "AWD", exteriorColor: "Daytona Grey",
    interiorColor: "Black Dinamica", condition: "Pre-owned", availabilityStatus: "Available", featured: false,
    createdDate: "2026-07-23", location: "ZECAR Main Showroom",
    description: "A low-mileage electric grand tourer with a subtle exterior and a highly resolved cabin. Fast charging and dual-motor all-wheel drive make it as usable as it is distinctive.",
    features: ["Adaptive air suspension", "Matrix LED headlights", "Bang & Olufsen audio", "Tour assistance", "360° camera", "Heated sport seats"],
    coverImage: img("1606664515524-ed2f786a0bd6"),
    galleryImages: [img("1606664515524-ed2f786a0bd6"), img("1619767886558-efdc259cde1a"), img("1617788138017-80ad40651399"), img("1593941707882-a5bba14938c7")],
  },
  {
    id: "zec-006", slug: "2022-land-rover-defender-110", make: "Land Rover", model: "Defender 110", year: 2022,
    price: 73900, currency: "USD", mileage: 22100, fuelType: "Diesel", transmission: "Automatic",
    engine: "3.0L turbo diesel inline-six", bodyType: "SUV", drivetrain: "AWD", exteriorColor: "Pangea Green",
    interiorColor: "Acorn grained leather", condition: "Pre-owned", availabilityStatus: "Recently Sold", featured: false,
    createdDate: "2026-06-18", location: "ZECAR Main Showroom",
    description: "A versatile long-wheelbase Defender in a natural, understated color combination. The cabin is configured for everyday utility while retaining the comfort expected on longer journeys.",
    features: ["Air suspension", "Terrain Response 2", "Meridian audio", "ClearSight mirror", "Tow package", "Heated front seats"],
    coverImage: img("1533473359331-0135ef1b58bf"),
    galleryImages: [img("1533473359331-0135ef1b58bf"), img("1606664515524-ed2f786a0bd6"), img("1500530855697-b586d89ba3ee"), img("1525609004556-c46c7d6cf023")],
  },
];
