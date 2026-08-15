import { describe, expect, it } from "vitest";
import { authorizeAdminAccess, hasSuperAdminRole, supabaseConfig } from "./supabase/config";

describe("trusted role guard", () => {
  it("accepts only trusted app metadata", () => expect(hasSuperAdminRole({ app_metadata: { role: "super_admin" } })).toBe(true));
  it.each([{ email: "nikoloz.chachua10@gmail.com" }, { user_metadata: { role: "super_admin" } }, { app_metadata: { role: "admin" } }, null])("rejects %j", user => expect(hasSuperAdminRole(user)).toBe(false));
});
describe("missing environment", () => { it("is a safe unconfigured state", () => expect(supabaseConfig({})).toEqual({ configured: false, url: null, anonKey: null })); });

describe("AAL1 admin access", () => {
  const owner = { app_metadata: { role: "super_admin" } };

  it("allows a trusted live member to reach MFA enrollment", () => {
    expect(authorizeAdminAccess(owner, true, "aal1", true)).toBe(true);
  });

  it("never lets allowAal1 bypass live membership", () => {
    expect(authorizeAdminAccess(owner, false, "aal1", true)).toBe(false);
  });

  it("never lets allowAal1 bypass the trusted role", () => {
    expect(authorizeAdminAccess({ app_metadata: { role: "admin" } }, true, "aal1", true)).toBe(false);
  });
});
