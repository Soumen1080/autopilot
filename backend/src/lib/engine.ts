// @ts-nocheck
/**
 * lib/engine.ts
 *
 * Thin bridge — re-exports Stellar utilities from src/stellar/
 * for backward compatibility with existing engine/ and routes/ code.
 *
 * All new code should import directly from src/stellar/*.
 */

import { Keypair } from "@stellar/stellar-sdk";
import { sendXLM, sendUSDC } from "../stellar/transaction";
import { getEngineSecret } from "./secrets";

export { fetchRecentPayments } from "../stellar/horizon";
export { loadKeypairFromBlob } from "../stellar/keypair";

type SqlClient = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

/** Engine server keypair — signs all automated transactions */
export async function getEngineKeypair(): Promise<typeof Keypair.prototype> {
  const secret = await getEngineSecret();
  return Keypair.fromSecret(secret);
}

/**
 * Execute an automated rule transaction.
 * Sends XLM or USDC from the engine account to a destination (vault or user wallet).
 *
 * The asset defaults to XLM so existing 3-argument callers keep working.
 * USDC requires a trustline on both the engine account and the destination —
 * vaults get one at creation time (see stellar/vault.ts).
 */
export async function executeRuleTransaction(
  destinationId: string,
  amount: string,
  memoText: string,
  asset: "XLM" | "USDC" = "XLM"
): Promise<string> {
  const engine = await getEngineKeypair();
  return asset === "USDC"
    ? sendUSDC(engine, destinationId, amount, memoText)
    : sendXLM(engine, destinationId, amount, memoText);
}

/** Atomically claim a Horizon payment so only one worker can process it. */
export async function claimPayment(
  paymentHorizonId: string,
  userId: string,
  sql: SqlClient
): Promise<boolean> {
  const rows = await sql`
    INSERT INTO "ProcessedPayment" ("paymentId", "userId", "createdAt")
    VALUES (${paymentHorizonId}, ${userId}::uuid, NOW())
    ON CONFLICT ("paymentId") DO NOTHING
    RETURNING "paymentId"
  `;
  return rows.length > 0;
}

export type { StellarPayment } from "../stellar/horizon";
