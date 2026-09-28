import { describe, expect, it } from "vitest";
import { doesPaymentMatchTrigger } from "../lib/paymentTrigger";

describe("doesPaymentMatchTrigger", () => {
  it("matches generic payment triggers for USDC", () => {
    expect(doesPaymentMatchTrigger("on every payment received", "USDC:issuer")).toBe(true);
  });

  it("matches a trigger that explicitly names USDC", () => {
    expect(doesPaymentMatchTrigger("on every USDC deposit", "USDC:issuer")).toBe(true);
    expect(doesPaymentMatchTrigger("on every USDC deposit", "XLM")).toBe(false);
  });

  it("keeps an XLM-only trigger restricted to XLM", () => {
    expect(doesPaymentMatchTrigger("on every XLM payment", "XLM")).toBe(true);
    expect(doesPaymentMatchTrigger("on every XLM payment", "USDC:issuer")).toBe(false);
  });

  it("does not match unsupported assets or non-payment text", () => {
    expect(doesPaymentMatchTrigger("on every payment received", "EUR:issuer")).toBe(false);
    expect(doesPaymentMatchTrigger("save 10 percent", "USDC:issuer")).toBe(false);
  });
});