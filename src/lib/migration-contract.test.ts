import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(new URL("../../supabase/migrations/20260815000000_superadmin_analytics.sql", import.meta.url), "utf8").toLowerCase();
describe("analytics migration", () => {
  it("creates the table idempotently and enables RLS", () => { expect(sql).toContain("create table if not exists public.analytics_events"); expect(sql).toContain("enable row level security"); });
  it("checks trusted JWT app metadata role", () => { expect(sql).toContain("app_metadata"); expect(sql).toContain("super_admin"); expect(sql).not.toContain("user_metadata"); });
  it("allows no browser mutation and keeps protected authenticated read", () => { expect(sql).not.toMatch(/grant insert[^;]*to (anon|authenticated)/); expect(sql).not.toMatch(/grant (update|delete)[^;]*to (anon|authenticated)/); expect(sql).not.toMatch(/grant select[^;]*to anon/); expect(sql).toMatch(/grant select[^;]*to authenticated/); });
  it("has idempotency, membership, aal2, retention, and dashboard RPC contracts", () => {
    expect(sql).toMatch(/event_id uuid not null unique/);
    expect(sql).toContain("create table if not exists public.analytics_admins");
    expect(sql).toContain("aal2");
    expect(sql).toContain("get_analytics_dashboard");
    expect(sql).toContain("asia\/tbilisi");
    expect(sql).toContain("generate_series");
    expect(sql).toMatch(/order by[^;]*created_at desc[^;]*id desc/);
    expect(sql).toContain("90 days");
    expect(sql).toMatch(/grant execute on function public\.get_analytics_dashboard\(integer\) to authenticated/);
  });
  it("indexes time, event, vehicle, and visitor", () => { for (const column of ["created_at", "event_name", "vehicle_slug", "visitor_id"]) expect(sql).toMatch(new RegExp(`create index if not exists[^;]*${column}`)); });
});
