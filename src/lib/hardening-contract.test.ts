import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { authorizeAdmin, hardenCookieOptions } from "./supabase/config";
import { checkAnalyticsRequest, createRateLimiter } from "./analytics-request";
import { classifyClick, sanitizeEventPayload } from "./analytics";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("analytics ingestion hardening", () => {
  it("requires a UUID event_id", () => {
    const base = { event_name: "page_view", path: "/", visitor_id: "visitor-12345678", session_id: "session-12345678", referrer_host: null, locale: "ka", device_class: "desktop", metadata: {} };
    expect(sanitizeEventPayload(base)).toBeNull();
    expect(sanitizeEventPayload({ ...base, event_id: "not-a-uuid" })).toBeNull();
    expect(sanitizeEventPayload({ ...base, event_id: "123e4567-e89b-42d3-a456-426614174000" })?.event_id).toBe("123e4567-e89b-42d3-a456-426614174000");
  });

  it("requires JSON and same-origin browser requests", () => {
    const headers = (values: Record<string, string>) => new Headers(values);
    expect(checkAnalyticsRequest(headers({ "content-type": "text/plain", host: "zecar.ge", origin: "https://zecar.ge" }))).toBe("content-type");
    expect(checkAnalyticsRequest(headers({ "content-type": "application/json", host: "zecar.ge", origin: "https://evil.test" }))).toBe("origin");
    expect(checkAnalyticsRequest(headers({ "content-type": "application/json", host: "zecar.ge", origin: "https://zecar.ge", "sec-fetch-site": "cross-site" }))).toBe("fetch-metadata");
    expect(checkAnalyticsRequest(headers({ "content-type": "application/json; charset=utf-8", host: "zecar.ge", origin: "https://zecar.ge", "sec-fetch-site": "same-origin" }))).toBeNull();
  });

  it.each([
    [{ "content-type": "application/json", host: "zecar.ge", origin: "not a url" }],
    [{ "content-type": "application/json", origin: "https://zecar.ge" }],
    [{ "content-type": "application/json", host: "bad host", origin: "https://zecar.ge" }],
    [{ "content-type": "application/json", host: "zecar.ge" }],
  ])("safely rejects malformed or missing Origin/Host headers: %j", values => {
    expect(() => checkAnalyticsRequest(new Headers(values))).not.toThrow();
    expect(checkAnalyticsRequest(new Headers(values))).toBe("origin");
  });

  it("rate limits by pseudonymous ID and evicts bounded state", () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, maxEntries: 2, now: () => now });
    expect(limiter.allow("a")).toBe(true); expect(limiter.allow("a")).toBe(true); expect(limiter.allow("a")).toBe(false);
    expect(limiter.allow("b")).toBe(true); expect(limiter.allow("c")).toBe(true);
    expect(limiter.size()).toBeLessThanOrEqual(2);
    now = 1001; expect(limiter.allow("a")).toBe(true);
  });

  it("uses a server-only service-role client", () => {
    const source = read("./supabase/service-role.ts");
    expect(source).toContain('import "server-only"');
    expect(source).toContain("SUPABASE_SERVICE_ROLE_KEY");
    const route = read("../app/api/analytics/events/route.ts");
    expect(route).toContain("createAnalyticsServiceClient");
    expect(route).not.toContain("anonKey");
  });
});

describe("private owner authorization", () => {
  const user = { app_metadata: { role: "super_admin" } };
  it("requires role, live membership, and aal2", () => {
    expect(authorizeAdmin(user, true, "aal2")).toBe(true);
    expect(authorizeAdmin(user, false, "aal2")).toBe(false);
    expect(authorizeAdmin(user, true, "aal1")).toBe(false);
    expect(authorizeAdmin({ app_metadata: { role: "admin" } }, true, "aal2")).toBe(false);
  });

  it("hardens admin auth cookies", () => {
    expect(hardenCookieOptions({ sameSite: "none", path: "/" }, true)).toMatchObject({ httpOnly: true, sameSite: "lax", secure: true, path: "/admin" });
  });
});

describe("tracker classification", () => {
  it("uses exact WhatsApp and configured credit hosts", () => {
    expect(classifyClick("https://fakewhatsapp.com/x", "https://zecar.ge")).toEqual({ eventName: "outbound_click", linkKind: "external" });
    expect(classifyClick("https://sub.whatsapp.com/x", "https://zecar.ge")?.linkKind).toBe("whatsapp");
    expect(classifyClick("https://notbends.test/x", "https://zecar.ge")?.linkKind).toBe("external");
  });
  it("rotates at 90 days, honors GPC/DNT, and sends referrer only on first page", () => {
    const tracker=read("../components/analytics-tracker.tsx");
    expect(tracker).toContain("90*86_400_000");
    expect(tracker).toContain("globalPrivacyControl"); expect(tracker).toContain('doNotTrack==="1"');
    expect(tracker).toContain("firstPage&&document.referrer");
    expect(tracker).toContain("zecar:inquiry-submitted");
    expect(read("../components/contact-form.tsx")).toContain("checkValidity()");
  });
});

describe("route and UI contracts", () => {
  it("restores a root localized public-shell 404 without duplication", () => {
    expect(existsSync(new URL("../app/not-found.tsx", import.meta.url))).toBe(true);
    expect(read("../app/not-found.tsx")).toContain("PublicShell");
    expect(read("../app/(public)/layout.tsx")).toContain("PublicShell");
    expect(read("../app/(public)/cars/[slug]/not-found.tsx")).toContain("NotFoundView");
    expect(read("../app/global-not-found.tsx")).toContain("PublicShell");
  });

  it("provides MFA, loading, English language sync, and absolute title", () => {
    expect(existsSync(new URL("../app/(admin)/admin/mfa/page.tsx", import.meta.url))).toBe(true);
    expect(existsSync(new URL("../app/(admin)/admin/loading.tsx", import.meta.url))).toBe(true);
    const layout = read("../app/(admin)/admin/layout.tsx");
    expect(layout).toContain("absolute:");
    expect(layout).toContain("AdminLanguageSync");
  });

  it("keeps HttpOnly sessions server-side throughout MFA and uses the real logout action", () => {
    const form = read("../components/admin/mfa-form.tsx");
    const actions = read("../app/(admin)/admin/actions.ts");
    const page = read("../app/(admin)/admin/mfa/page.tsx");
    expect(form).not.toContain("createSupabaseBrowserClient");
    expect(actions).toContain("createSupabaseServerClient");
    expect(actions).toContain("auth.mfa.enroll");
    expect(actions).toContain("auth.mfa.challengeAndVerify");
    expect(actions).toContain("analytics_admins");
    expect(actions.match(/requireMfaAccess\(\)/g)?.length).toBeGreaterThanOrEqual(2);
    expect(page).toContain("Access denied");
    expect(form).toContain("action={logout}");
  });
});
