export const EVENT_NAMES = ["page_view", "vehicle_view", "contact_click", "outbound_click"] as const;
export type EventName = typeof EVENT_NAMES[number];
export type DeviceClass = "mobile" | "tablet" | "desktop" | "unknown";
export type AnalyticsEvent = { event_id: string; event_name: EventName; path: string; vehicle_slug?: string | null; visitor_id: string; session_id: string; referrer_host: string | null; locale: string; device_class: DeviceClass; metadata: { return_visitor?: boolean; link_kind?: string } };
const linkKinds = new Set(["phone", "email", "whatsapp", "inquiry", "external", "credit"]);

export function sanitizeEventPayload(value: unknown): AnalyticsEvent | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (typeof input.event_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.event_id)) return null;
  if (!EVENT_NAMES.includes(input.event_name as EventName)) return null;
  if (typeof input.path !== "string") return null;
  const path = input.path.split(/[?#]/, 1)[0];
  if (!path.startsWith("/") || path.startsWith("/admin") || path.length > 300) return null;
  const id = (key: string) => typeof input[key] === "string" && (input[key] as string).trim().length >= 8 && (input[key] as string).length <= 100 ? (input[key] as string).trim() : null;
  const visitor = id("visitor_id"), session = id("session_id");
  if (!visitor || !session) return null;
  const slug = input.vehicle_slug == null ? null : typeof input.vehicle_slug === "string" && /^[a-z0-9-]{1,100}$/.test(input.vehicle_slug) ? input.vehicle_slug : undefined;
  if (slug === undefined) return null;
  let referrer: string | null = null;
  if (typeof input.referrer_host === "string" && input.referrer_host) {
    if (input.referrer_host.length > 253 || !/^[a-z0-9.-]+$/i.test(input.referrer_host)) return null;
    referrer = input.referrer_host.toLowerCase();
  }
  const locale = typeof input.locale === "string" && /^(ka|en|ru)$/.test(input.locale) ? input.locale : "unknown";
  const device = ["mobile", "tablet", "desktop", "unknown"].includes(String(input.device_class)) ? input.device_class as DeviceClass : "unknown";
  const rawMeta = input.metadata && typeof input.metadata === "object" ? input.metadata as Record<string, unknown> : {};
  const metadata: AnalyticsEvent["metadata"] = {};
  if (typeof rawMeta.return_visitor === "boolean") metadata.return_visitor = rawMeta.return_visitor;
  if (typeof rawMeta.link_kind === "string" && linkKinds.has(rawMeta.link_kind)) metadata.link_kind = rawMeta.link_kind;
  return { event_id: input.event_id, event_name: input.event_name as EventName, path, ...(slug ? { vehicle_slug: slug } : input.vehicle_slug === null ? { vehicle_slug: null } : {}), visitor_id: visitor, session_id: session, referrer_host: referrer, locale, device_class: device, metadata };
}

export function classifyClick(href: string, origin: string, action?: string | null) {
  if (action === "inquiry") return { eventName: "contact_click" as const, linkKind: "inquiry" };
  if (href.startsWith("tel:")) return { eventName: "contact_click" as const, linkKind: "phone" };
  if (href.startsWith("mailto:")) return { eventName: "contact_click" as const, linkKind: "email" };
  try { const url = new URL(href, origin); const host=url.hostname.toLowerCase(); if (host === "wa.me" || host === "whatsapp.com" || host.endsWith(".whatsapp.com")) return { eventName: "contact_click" as const, linkKind: "whatsapp" }; if (url.origin !== origin) { return { eventName: "outbound_click" as const, linkKind: url.href === new URL(dealership.websiteCreditUrl).href ? "credit" : "external" }; } } catch { return null; }
  return null;
}
import { dealership } from "@/data/dealership";
