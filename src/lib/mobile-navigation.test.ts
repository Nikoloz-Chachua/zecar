import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const header = readFileSync(new URL("../components/header.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../components/localized-pages.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("mobile catalogue access", () => {
  it("renders the menu trigger as a solid high-contrast control", () => {
    expect(header).toContain('<><span /><span /><span /></>');
    expect(css).toMatch(/\.menu-button\s*\{[^}]*background:\s*var\(--ink\)/);
    expect(css).toMatch(/\.menu-button\s+span\s*\{[^}]*background:\s*(?:#fff|white)/);
  });

  it("keeps language controls inside the mobile menu instead of crowding the header", () => {
    expect(header).toContain('className="mobile-languages"');
    expect(css).toMatch(/@media\s*\(max-width:\s*620px\)[\s\S]*?\.header-tools\s*\{[^}]*display:\s*none/);
  });

  it("provides a direct mobile catalogue action in the hero", () => {
    expect(home).toContain('className="mobile-catalog-cta"');
    expect(home).toContain('href="/cars"');
    expect(css).toMatch(/\.mobile-catalog-cta\s*\{[\s\S]*?display:\s*none/);
    expect(css).toMatch(/@media\s*\(max-width:\s*620px\)[\s\S]*\.mobile-catalog-cta\s*\{[\s\S]*?display:\s*inline-flex/);
  });
});
