import { describe, expect, it } from "vitest";
import { aggregateEvents, fetchEventPages, validateDateRange } from "./admin-analytics";

const event = (overrides = {}) => ({ created_at: "2026-08-14T10:00:00Z", event_name: "page_view", path: "/cars", vehicle_slug: null, visitor_id: "v1", session_id: "s1", referrer_host: null, locale: "ka", device_class: "desktop", metadata: {}, ...overrides });

describe("validateDateRange", () => { it.each([["7", 7], ["30", 30], ["90", 90], ["12", 30], [undefined, 30]])("validates %s", (input, expected) => expect(validateDateRange(input)).toBe(expected)); });
describe("aggregateEvents", () => {
  it("counts KPIs and deduplicates browser visitors", () => {
    const result = aggregateEvents([event(), event({ session_id: "s2" }), event({ visitor_id: "", session_id: "legacy" }), event({ event_name: "vehicle_view", vehicle_slug: "kia-soul" }), event({ event_name: "contact_click", metadata: { link_kind: "phone" } })]);
    expect(result.kpis).toEqual({ pageViews: 3, uniqueVisitors: 2, sessions: 3, vehicleViews: 1, contactClicks: 1 });
  });
  it("ignores blank IDs and falls back to non-empty session only", () => expect(aggregateEvents([event({ visitor_id: "", session_id: "" }), event({ visitor_id: null, session_id: "fallback" })]).kpis.uniqueVisitors).toBe(1));
  it("derives visitors and sessions from page views only", () => {
    const result = aggregateEvents([
      event({ visitor_id: "page-visitor", session_id: "page-session" }),
      event({ event_name: "contact_click", visitor_id: "contact-only", session_id: "contact-session" }),
      event({ event_name: "vehicle_view", visitor_id: "vehicle-only", session_id: "vehicle-session" }),
    ]);
    expect(result.kpis.uniqueVisitors).toBe(1);
    expect(result.kpis.sessions).toBe(1);
  });
  it("uses the session fallback only when a page view visitor ID is missing", () => {
    const result = aggregateEvents([
      event({ visitor_id: "visitor", session_id: "session-a" }),
      event({ visitor_id: "visitor", session_id: "session-b" }),
      event({ visitor_id: " ", session_id: "legacy-session" }),
      event({ visitor_id: null, session_id: " " }),
    ]);
    expect(result.kpis.uniqueVisitors).toBe(2);
    expect(result.kpis.sessions).toBe(3);
  });
  it("builds sorted daily and top breakdowns", () => {
    const result = aggregateEvents([event(), event(), event({ path: "/", referrer_host: "google.com", device_class: "mobile", locale: "en" })]);
    expect(result.daily).toEqual([{ date: "2026-08-14", count: 3 }]);
    expect(result.topPages[0]).toEqual({ label: "/cars", count: 2 });
    expect(result.referrers).toContainEqual({ label: "Direct", count: 2 });
  });
  it("makes the daily trend page views only", () => {
    const result = aggregateEvents([event(), event({ event_name: "contact_click" }), event({ event_name: "vehicle_view" })]);
    expect(result.daily).toEqual([{ date: "2026-08-14", count: 1 }]);
  });
});

describe("fetchEventPages", () => {
  it("paginates in bounded chunks, preserves order, and detects truncation", async () => {
    const rows = Array.from({ length: 10_001 }, (_, index) => index);
    const ranges: Array<[number, number]> = [];
    const result = await fetchEventPages(async (from, to) => {
      ranges.push([from, to]);
      return { data: rows.slice(from, to + 1), error: null };
    });
    expect(ranges[0]).toEqual([0, 999]);
    expect(ranges.at(-1)).toEqual([10_000, 10_000]);
    expect(result).toEqual({ data: rows.slice(0, 10_000), error: null, truncated: true });
  });

  it("stops after a short page and propagates query errors safely", async () => {
    const calls: Array<[number, number]> = [];
    const complete = await fetchEventPages(async (from, to) => {
      calls.push([from, to]);
      return { data: from === 0 ? [3, 2, 1] : [], error: null };
    });
    expect(complete).toEqual({ data: [3, 2, 1], error: null, truncated: false });
    expect(calls).toEqual([[0, 999]]);

    const failure = new Error("query failed");
    await expect(fetchEventPages(async () => ({ data: null, error: failure }))).resolves.toEqual({ data: [], error: failure, truncated: false });
  });
});
