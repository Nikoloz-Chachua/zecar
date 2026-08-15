export type EventRow = { created_at: string; event_name: string; path: string; vehicle_slug: string | null; visitor_id: string | null; session_id: string | null; referrer_host: string | null; locale: string; device_class: string; metadata: Record<string, unknown> | null };
const countBy = (items: string[]) => [...items.reduce((map, label) => map.set(label, (map.get(label) ?? 0) + 1), new Map<string, number>())].map(([label, count]) => ({ label, count })).sort((a,b) => b.count-a.count || a.label.localeCompare(b.label));
export function validateDateRange(value?: string | string[]): 7 | 30 | 90 { const v = Array.isArray(value) ? value[0] : value; return v === "7" ? 7 : v === "90" ? 90 : 30; }
export function parseDashboard(value:unknown){if(!value||typeof value!=="object")return null;const v=value as Record<string,unknown>;const k=v.kpis as Record<string,unknown>|undefined;const lists=["daily","topVehicles","topPages","contacts","referrers","devices","locales","recent"];if(v.timezone!=="Asia/Tbilisi"||!k||!lists.every(key=>Array.isArray(v[key])))return null;const numbers=["pageViews","uniqueVisitors","tabSessions","vehicleViews","contactClicks"];if(!numbers.every(key=>typeof k[key]==="number"&&Number.isFinite(k[key])))return null;return{timezone:"Asia/Tbilisi" as const,kpis:{pageViews:k.pageViews as number,uniqueVisitors:k.uniqueVisitors as number,sessions:k.tabSessions as number,vehicleViews:k.vehicleViews as number,contactClicks:k.contactClicks as number},daily:v.daily as {date:string;count:number}[],topVehicles:v.topVehicles as {label:string;count:number}[],topPages:v.topPages as {label:string;count:number}[],contacts:v.contacts as {label:string;count:number}[],referrers:v.referrers as {label:string;count:number}[],devices:v.devices as {label:string;count:number}[],locales:v.locales as {label:string;count:number}[],recent:v.recent as EventRow[]}}
export function rangeStartIso(days: number, now = new Date()): string { return new Date(now.getTime() - days * 86_400_000).toISOString(); }
export function aggregateEvents(events: EventRow[]) {
  const clean = (v: string | null) => v?.trim() || null;
  const pageViews = events.filter(e=>e.event_name === "page_view");
  const visitors = new Set(pageViews.map(e => clean(e.visitor_id) ? `v:${clean(e.visitor_id)}` : clean(e.session_id) ? `s:${clean(e.session_id)}` : null).filter(Boolean));
  const sessions = new Set(pageViews.map(e => clean(e.session_id)).filter(Boolean));
  return { kpis: { pageViews: pageViews.length, uniqueVisitors: visitors.size, sessions: sessions.size, vehicleViews: events.filter(e=>e.event_name === "vehicle_view").length, contactClicks: events.filter(e=>e.event_name === "contact_click").length },
    daily: countBy(pageViews.map(e=>e.created_at.slice(0,10))).map(({label,count})=>({date:label,count})).sort((a,b)=>a.date.localeCompare(b.date)),
    topVehicles: countBy(events.filter(e=>e.event_name === "vehicle_view" && e.vehicle_slug).map(e=>e.vehicle_slug!)), topPages: countBy(pageViews.map(e=>e.path)),
    contacts: countBy(events.filter(e=>e.event_name === "contact_click").map(e=>String(e.metadata?.link_kind || "unknown"))), referrers: countBy(pageViews.map(e=>e.referrer_host || "Direct")), devices: countBy(events.map(e=>e.device_class || "unknown")), locales: countBy(events.map(e=>e.locale || "unknown")), recent: events.slice(0,20) };
}

export async function fetchEventPages<Row, ErrorType = unknown>(fetchPage: (from: number, to: number) => Promise<{ data: Row[] | null; error: ErrorType | null }>, maximum = 10_000, pageSize = 1_000) {
  const data: Row[] = [];
  while (data.length <= maximum) {
    const remaining = maximum + 1 - data.length;
    const requested = Math.min(pageSize, remaining);
    const { data: page, error } = await fetchPage(data.length, data.length + requested - 1);
    if (error) return { data: [] as Row[], error, truncated: false };
    const rows = page ?? [];
    data.push(...rows);
    if (rows.length < requested) break;
  }
  return { data: data.slice(0, maximum), error: null, truncated: data.length > maximum };
}
