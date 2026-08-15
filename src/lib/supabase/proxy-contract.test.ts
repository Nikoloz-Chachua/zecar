import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const srcProxyUrl = new URL("../../proxy.ts", import.meta.url);
const rootProxyUrl = new URL("../../../proxy.ts", import.meta.url);
const helperSource = readFileSync(new URL("./proxy.ts", import.meta.url), "utf8");

describe("Supabase session refresh proxy contract", () => {
  it("places the proxy beside the src-based app instead of at repository root", () => {
    expect(existsSync(srcProxyUrl)).toBe(true);
    expect(existsSync(rootProxyUrl)).toBe(false);
  });

  it("matches the complete private admin route tree", () => {
    const proxySource = readFileSync(srcProxyUrl, "utf8");

    expect(proxySource).toMatch(/matcher:\s*["']\/admin\/:path\*["']/);
  });

  it("propagates refreshed cookies to both the request and response", () => {
    expect(helperSource).toContain("request.cookies.set(name, value)");
    expect(helperSource).toContain("supabaseResponse.cookies.set(name, value, hardenCookieOptions(options))");
    expect(helperSource).toContain("NextResponse.next({ request })");
  });

  it("validates auth but leaves trusted role authorization to the page", () => {
    expect(helperSource).toMatch(/supabase\.auth\.(getClaims|getUser)\(\)/);
    expect(helperSource).not.toMatch(/user_metadata|\.email|super_admin/);
    const page = readFileSync(new URL("../../app/(admin)/admin/page.tsx", import.meta.url), "utf8");
    const access = readFileSync(new URL("./admin-access.ts", import.meta.url), "utf8");
    expect(page).toContain("adminAccess()");
    expect(access).toContain("authorizeAdminAccess(user");
  });
});
