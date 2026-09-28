/**
 * lib/engine.ts
 *
 * Thin bridge — re-exports Stellar utilities from src/stellar/
 * for backward compatibility with existing engine/ and routes/ code.
 *
 * All new code should import directly from src/stellar/*.
 */

import { Keypair } from "@stellar/stellar-sdk";
import { sendXLM } from "../stellar/transaction";

export { fetchRecentPayments } from "../stellar/horizon";
export { loadKeypairFromBlob } from "../stellar/keypair";

type SqlClient = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

/** Engine server keypair — signs all automated transactions */
export function getEngineKeypair(): typeof Keypair.prototype {
  const secret = process.env.AUTOPILOT_SECRET_KEY;
  if (!secret) throw new Error("AUTOPILOT_SECRET_KEY not set in environment");
  return Keypair.fromSecret(secret);
}

/**
 * Execute an automated rule transaction.
 * Sends XLM from the engine account to a destination (vault or user wallet).
 */
export async function executeRuleTransaction(
  destinationId: string,
  amountXLM: string,
  memoText: string
): Promise<string> {
  const engine = getEngineKeypair();
  return sendXLM(engine, destinationId, amountXLM, memoText);
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
