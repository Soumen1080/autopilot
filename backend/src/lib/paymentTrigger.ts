const SUPPORTED_ASSETS = new Set(["XLM", "USDC"]);

export function doesPaymentMatchTrigger(trigger: string, asset: string): boolean {
  const normalizedTrigger = trigger.toLowerCase();
  const assetCode = asset.trim().toUpperCase().split(":", 1)[0];

  if (!SUPPORTED_ASSETS.has(assetCode)) return false;

  const isPaymentTrigger =
    normalizedTrigger.includes("every payment") ||
    normalizedTrigger.includes("payment") ||
    normalizedTrigger.includes("receive") ||
    normalizedTrigger.includes("received") ||
    normalizedTrigger.includes("incoming") ||
    normalizedTrigger.includes("deposit") ||
    normalizedTrigger.includes("salary") ||
    normalizedTrigger.includes("income") ||
    normalizedTrigger.includes("transfer");

  if (!isPaymentTrigger) return false;

  const requestedAssets = ["xlm", "usdc"].filter((candidate) =>
    normalizedTrigger.includes(candidate)
  );

  return requestedAssets.length === 0 || requestedAssets.includes(assetCode.toLowerCase());
}