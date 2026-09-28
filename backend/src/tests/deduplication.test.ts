import { describe, expect, it } from "vitest";
import { claimPayment } from "../lib/engine";

function fakeSql(result: any[]) {
  return async (_strings: TemplateStringsArray, ..._values: any[]) => result;
}

describe("claimPayment", () => {
  it("claims a payment when the insert returns a row", async () => {
    await expect(
      claimPayment("payment-1", "00000000-0000-0000-0000-000000000001", fakeSql([{ paymentId: "payment-1" }]))
    ).resolves.toBe(true);
  });

  it("rejects a payment already claimed by another worker", async () => {
    await expect(
      claimPayment("payment-1", "00000000-0000-0000-0000-000000000001", fakeSql([]))
    ).resolves.toBe(false);
  });
});