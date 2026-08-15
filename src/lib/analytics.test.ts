import { describe, expect, it } from "vitest";
import { classifyClick, sanitizeEventPayload } from "./analytics";
import { dealership } from "../data/dealership";

const valid = { event_id: "123e4567-e89b-42d3-a456-426614174000", event_name: "page_view", path: "/cars", visitor_id: "visitor-12345678", session_id: "session-12345678", referrer_host: "example.com", locale: "ka", device_class: "mobile", metadata: { return_visitor: true } };

describe("sanitizeEventPayload", () => {
  it("accepts a valid privacy-conscious event", () => expect(sanitizeEventPayload(valid)).toEqual(valid));
  it("removes query strings and hashes", () => expect(sanitizeEventPayload({ ...valid, path: "/cars?q=x#top" })?.path).toBe("/cars"));
  it.each(["javascript:alert(1)", "https://evil.test/x", "admin", "/admin"])("rejects unsafe/private path %s", path => expect(sanitizeEventPayload({ ...valid, path })).toBeNull());
  it("rejects unknown event names and overlong values", () => {
    expect(sanitizeEventPayload({ ...valid, event_name: "identify" })).toBeNull();
    expect(sanitizeEventPayload({ ...valid, vehicle_slug: "x".repeat(101) })).toBeNull();
  });
  it("allowlists metadata and normalizes unknown values", () => expect(sanitizeEventPayload({ ...valid, metadata: { return_visitor: true, link_kind: "phone", secret: "no" }, referrer_host: "", locale: "xx", device_class: "watch" })).toMatchObject({ metadata: { return_visitor: true, link_kind: "phone" }, referrer_host: null, locale: "unknown", device_class: "unknown" }));
});

describe("classifyClick", () => {
  it.each([["tel:+1", "contact_click", "phone"], ["mailto:a@b.test", "contact_click", "email"], ["https://wa.me/1", "contact_click", "whatsapp"], ["https://other.test/x", "outbound_click", "external"]])("classifies %s", (href, eventName, linkKind) => expect(classifyClick(href, "https://zecar.ge")).toEqual({ eventName, linkKind }));
  it("recognizes explicit inquiry actions", () => expect(classifyClick("/contact", "https://zecar.ge", "inquiry")).toEqual({ eventName: "contact_click", linkKind: "inquiry" }));
  it("ignores internal links", () => expect(classifyClick("/cars", "https://zecar.ge")).toBeNull());
  it("recognizes the exact configured BENDS credit URL without environment configuration", () => {
    expect(classifyClick(dealership.websiteCreditUrl, "https://zecar.ge")).toEqual({ eventName: "outbound_click", linkKind: "credit" });
    expect(classifyClick("https://bends-digital-studio.vercel.app.evil.test", "https://zecar.ge")).toEqual({ eventName: "outbound_click", linkKind: "external" });
  });
});
