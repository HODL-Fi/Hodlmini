import { ParsedTransaction, isCngnToken } from "./parseTransaction";

/**
 * Format transaction amount for display
 * Returns: "1.00 USDC ($1.00)" or "100.00 cNGN (₦100.00)"
 */
export function formatTransactionAmount(
  tx: ParsedTransaction,
  tokenPriceUsd: number = 0,
  convertUsdToNgn?: (usd: number) => number
): string {
  const { normalizedAmount, tokenSymbol, tokenAddress } = tx;
  const symbol = tokenSymbol ?? "TOKEN";
  
  // Format token amount
  let tokenAmount: string;
  if (normalizedAmount >= 1) {
    tokenAmount = normalizedAmount.toFixed(2);
  } else if (normalizedAmount >= 0.01) {
    tokenAmount = normalizedAmount.toFixed(4);
  } else {
    tokenAmount = normalizedAmount.toFixed(6);
  }
  
  // Remove trailing zeros
  tokenAmount = parseFloat(tokenAmount).toString();
  
  const isCngn = isCngnToken(tokenAddress);
  
  // Calculate secondary value
  let secondaryValue: string | null = null;
  
  if (isCngn && convertUsdToNgn) {
    // For cNGN, show NGN equivalent (assuming 1:1 or use price if available)
    // If we have USD price, convert USD -> NGN
    if (tokenPriceUsd > 0) {
      const usdValue = normalizedAmount * tokenPriceUsd;
      const ngnValue = convertUsdToNgn(usdValue);
      secondaryValue = `₦${ngnValue.toFixed(2)}`;
    } else {
      // Fallback: assume 1 cNGN = 1 NGN (or use a default rate)
      secondaryValue = `₦${normalizedAmount.toFixed(2)}`;
    }
  } else if (tokenPriceUsd > 0) {
    // For other tokens, show USD equivalent
    const usdValue = normalizedAmount * tokenPriceUsd;
    secondaryValue = `$${usdValue.toFixed(2)}`;
  }
  
  if (secondaryValue) {
    return `${tokenAmount} ${symbol} (${secondaryValue})`;
  }
  
  return `${tokenAmount} ${symbol}`;
}

/**
 * Format transaction timestamp for display
 * Returns: "Jan 5, 2026 at 10:14 PM" or "2 hours ago"
 */
export function formatTransactionTimestamp(createdAt: string, useRelative: boolean = false): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (useRelative) {
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }
  
  // Format: "Jan 5, 2026 at 10:14 PM"
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  
  return `${day} ${month}, ${year} at ${displayHours}:${displayMinutes}${ampm}`;
}

/**
 * Format transaction hash for display (truncated)
 * Returns: "0x3d96...e752"
 */
export function formatTransactionHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

/**
 * Get transaction amount with sign for display
 * Returns: "+1.00 USDC ($1.00)" or "-1.00 USDC ($1.00)"
 */
export function formatTransactionAmountWithSign(
  tx: ParsedTransaction,
  tokenPriceUsd: number = 0,
  convertUsdToNgn?: (usd: number) => number
): string {
  const amount = formatTransactionAmount(tx, tokenPriceUsd, convertUsdToNgn);
  const isNegative = tx.type === "borrow" || tx.type === "withdraw";
  return isNegative ? `-${amount}` : `+${amount}`;
}

