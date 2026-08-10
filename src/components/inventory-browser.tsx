"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { vehicles } from "@/data/vehicles";
import { filterVehicles, sortVehicles } from "@/lib/vehicles";
import type { VehicleFilters, VehicleSort } from "@/types/vehicle";
import { Close, Filter } from "./icons";
import { VehicleCard } from "./vehicle-card";

const defaults: VehicleFilters = {};
const makes = [...new Set(vehicles.map((v) => v.make))].sort();

function Filters({ filters, update, reset }: { filters: VehicleFilters; update: (key: keyof VehicleFilters, value: string | number | undefined) => void; reset: () => void }) {
  const field = (label: string, key: keyof VehicleFilters, options: string[]) => <label><span>{label}</span><select value={String(filters[key] ?? "")} onChange={(e) => update(key, e.target.value || undefined)}><option value="">All</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
  return <div className="filter-fields">
    <label className="search-field"><span>Search make or model</span><input type="search" placeholder="e.g. Volvo XC90" value={filters.search ?? ""} onChange={(e) => update("search", e.target.value || undefined)} /></label>
    {field("Make", "make", makes)}
    <label><span>Year from</span><select value={filters.yearMin ?? ""} onChange={(e) => update("yearMin", e.target.value ? Number(e.target.value) : undefined)}><option value="">Any year</option>{[2024, 2023, 2022, 2021].map((y) => <option key={y}>{y}</option>)}</select></label>
    <label><span>Price up to</span><select value={filters.priceMax ?? ""} onChange={(e) => update("priceMax", e.target.value ? Number(e.target.value) : undefined)}><option value="">Any price</option>{[60000, 75000, 90000, 125000].map((p) => <option key={p} value={p}>${p.toLocaleString()}</option>)}</select></label>
    <label><span>Mileage up to</span><select value={filters.mileageMax ?? ""} onChange={(e) => update("mileageMax", e.target.value ? Number(e.target.value) : undefined)}><option value="">Any mileage</option>{[10000, 20000, 30000, 50000].map((m) => <option key={m} value={m}>{m.toLocaleString()} mi</option>)}</select></label>
    {field("Fuel", "fuelType", ["Petrol", "Diesel", "Hybrid", "Electric"])}
    {field("Transmission", "transmission", ["Automatic", "Manual"])}
    {field("Body", "bodyType", ["SUV", "Sedan", "Coupe", "Wagon"])}
    {field("Availability", "availabilityStatus", ["Available", "Reserved", "Recently Sold"])}
    <button className="text-button" type="button" onClick={reset}>Reset all filters</button>
  </div>;
}

export function InventoryBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<VehicleFilters>(() => ({ search: searchParams.get("q") || undefined, make: searchParams.get("make") || undefined }));
  const [sort, setSort] = useState<VehicleSort>("newest");
  const [drawer, setDrawer] = useState(false);
  const results = useMemo(() => sortVehicles(filterVehicles(vehicles, filters), sort), [filters, sort]);
  const update = (key: keyof VehicleFilters, value: string | number | undefined) => setFilters((current) => ({ ...current, [key]: value }));
  const reset = () => setFilters(defaults);
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("q", filters.search);
    if (filters.make) params.set("make", filters.make);
    router.replace(params.size ? `/cars?${params}` : "/cars", { scroll: false });
  }, [filters.search, filters.make, router]);
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  return <div className="inventory-layout">
    <aside className="filters-desktop" aria-label="Inventory filters"><div className="filter-title"><h2>Filter inventory</h2><Filter className="icon" /></div><Filters filters={filters} update={update} reset={reset} /></aside>
    <section className="results" aria-labelledby="results-title">
      <div className="results-bar"><div><p id="results-title"><strong>{results.length}</strong> {results.length === 1 ? "vehicle" : "vehicles"}</p><button className="filter-trigger" type="button" onClick={() => setDrawer(true)}><Filter className="icon" /> Filters</button></div><label><span className="sr-only">Sort vehicles</span><select value={sort} onChange={(e) => setSort(e.target.value as VehicleSort)}><option value="newest">Newest listings</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="year-newest">Year: newest</option><option value="mileage-lowest">Mileage: lowest</option></select></label></div>
      {results.length ? <div className="inventory-grid">{results.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div> : <div className="empty-state"><p className="eyebrow">No matches</p><h2>Let’s widen the search.</h2><p>Try clearing one or more filters to see the available sample inventory.</p><button className="button primary" type="button" onClick={reset}>Reset filters</button></div>}
    </section>
    {drawer && <div className="drawer-backdrop" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) setDrawer(false); }}><aside className="filter-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><div className="drawer-head"><h2 id="drawer-title">Filter inventory</h2><button type="button" aria-label="Close filters" onClick={() => setDrawer(false)}><Close className="icon" /></button></div><Filters filters={filters} update={update} reset={reset} /><button className="button primary full" type="button" onClick={() => setDrawer(false)}>Show {results.length} vehicles</button></aside></div>}
  </div>;
}
