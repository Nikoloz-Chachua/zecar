import { describe, expect, it } from "vitest";
import { dealership } from "./dealership";

describe("dealership contact details", () => {
  it("uses the production Georgian phone number for calls and WhatsApp", () => {
    expect(dealership.phone).toBe("+995 577 09 84 82");
    expect(dealership.phoneHref).toBe("+995577098482");
    expect(dealership.whatsapp).toBe("995577098482");
  });

  it("uses the real inquiry email and BENDS credit URL without hours data", () => {
    expect(dealership.email).toBe("nikoloz.chachua10@gmail.com");
    expect(dealership.websiteCreditUrl).toBe("https://bends-digital-studio.vercel.app");
    expect(dealership).not.toHaveProperty("hours");
  });
});
