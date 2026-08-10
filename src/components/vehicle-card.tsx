import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/types/vehicle";
import { buildWhatsAppUrl } from "@/lib/inquiry";
import { formatCurrency, formatMileage } from "@/lib/vehicles";
import { Arrow, Message } from "./icons";

export function VehicleCard({ vehicle, priority = false }: { vehicle: Vehicle; priority?: boolean }) {
  const isNew = new Date(vehicle.createdDate) >= new Date("2026-07-20");
  return <article className="vehicle-card">
    <Link href={`/cars/${vehicle.slug}`} className="card-image" aria-label={`View ${vehicle.year} ${vehicle.make} ${vehicle.model}`}>
      <Image src={vehicle.coverImage} alt={`${vehicle.exteriorColor} ${vehicle.make} ${vehicle.model}, exterior view`} fill sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" priority={priority} />
      <div className="badges">{vehicle.featured && <span>Featured</span>}{isNew && <span>New arrival</span>}</div>
    </Link>
    <div className="card-body"><div className="card-head"><div><p className="eyebrow">{vehicle.year} · {vehicle.condition}</p><h3>{vehicle.make} {vehicle.model}</h3></div><strong>{formatCurrency(vehicle.price, vehicle.currency)}</strong></div>
      <div className="card-specs"><span>{formatMileage(vehicle.mileage)}</span><span>{vehicle.fuelType}</span><span>{vehicle.transmission}</span><span>{vehicle.bodyType}</span></div>
      <div className="card-actions"><Link href={`/cars/${vehicle.slug}`}>View details <Arrow className="icon" /></Link><a href={buildWhatsAppUrl(vehicle)} target="_blank" rel="noreferrer" aria-label={`Ask about ${vehicle.make} ${vehicle.model} on WhatsApp`}><Message className="icon" /> WhatsApp</a></div>
    </div>
  </article>;
}
