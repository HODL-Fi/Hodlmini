import { TxHistory } from "@/hooks/user/useGetUserTxHistory";
import { CNGN_ADDRESSES, CNGN_BASE_ADDRESS } from "@/utils/constants/cngn";
import { getTokenDecimals, ETHER_ADDRESS } from "@/utils/constants/tokenDecimals";

export type ParsedTransactionType = "borrow" | "repay" | "deposit" | "withdraw" | "swap" | "offramp";
export type ParsedTransactionStatus = "success" | "pending" | "failed";

export interface ParsedTransaction {
  id: string;
  type: ParsedTransactionType;
  status: ParsedTransactionStatus;
  amount: string; // Raw amount in smallest units
  normalizedAmount: number; // Normalized amount (human-readable)
  tokenAddress: string | null;
  tokenSymbol: string | null;
  tokenDecimals: number;
  transactionHash: string;
  walletType: string;
  createdAt: string;
  updatedAt: string;
  remark: string;
  transactionNo?: string;
  receiver?: {
    name: string;
    accountNumber: string;
    bankName: string;
    currency?: string;
  };
}

/**
 * Extract token address from remark string
 * Pattern: "Action AMOUNT of 0x... to/from vault"
 */
export function extractTokenAddress(remark: string): string | null {
  // Match Ethereum address pattern (0x followed by 40 hex characters)
  const addressPattern = /0x[a-fA-F0-9]{40}/;
  const match = remark.match(addressPattern);
  return match ? match[0] : null;
}

/**
 * Determine transaction type from transactionType and remark
 */
export function determineTransactionType(
  transactionType: TxHistory["transactionType"],
  remark: string
): ParsedTransactionType {
  if (transactionType === "BORROW") {
    // Check if it's a repay (to vault) or borrow (from vault)
    if (remark.toLowerCase().includes("to vault")) {
      return "repay";
    } else if (remark.toLowerCase().includes("from vault")) {
      return "borrow";
    }
    // Default to borrow if unclear
    return "borrow";
  }
  
  if (transactionType === "DEPOSIT") {
    return "deposit";
  }
  
  if (transactionType === "WITHDRAW") {
    return "withdraw";
  }
  
  if (transactionType === "SWAP") {
    // Check if it's an offramp transaction
    if (remark.toLowerCase().includes("off-ramp") || remark.toLowerCase().includes("offramp")) {
      return "offramp";
    }
    return "swap";
  }
  
  // Fallback
  return "deposit";
}

/**
 * Normalize transaction status
 */
export function normalizeStatus(status: TxHistory["status"]): ParsedTransactionStatus {
  if (status === "SUCCESS") return "success";
  if (status === "PENDING") return "pending";
  if (status === "FAILED") return "failed";
  return "success"; // Default
}

/**
 * Parse a raw transaction from API into a structured format
 */
export function parseTransaction(
  tx: TxHistory,
  tokenMetadata?: { symbol?: string | null; decimals?: number | null; name?: string | null }
): ParsedTransaction {
  // For offramp transactions, get token address from collateralAssets
  let tokenAddress: string | null = null;
  if (tx.transactionType === "SWAP" && tx.collateralAssets && tx.collateralAssets.length > 0) {
    tokenAddress = tx.collateralAssets[0].toLowerCase();
  } else {
    tokenAddress = extractTokenAddress(tx.remark);
  }
  
  const type = determineTransactionType(tx.transactionType, tx.remark);
  const status = normalizeStatus(tx.status);
  
  // Check if this is Ether (special address), cNGN, or Mantle native token
  let tokenSymbol = tokenMetadata?.symbol ?? null;
  if (tokenAddress) {
    const normalizedAddr = tokenAddress.toLowerCase().trim();
    const etherAddr = ETHER_ADDRESS.toLowerCase();
    const isPlaceholderAddress = normalizedAddr === etherAddr;
    
    // Check if this is Mantle native token (placeholder address on Mantle chain)
    const isMantleChain = tx.walletType?.toLowerCase().includes("mantle");
    if (isMantleChain && isPlaceholderAddress) {
      tokenSymbol = "MNT";
    } else if (normalizedAddr === etherAddr) {
      tokenSymbol = "ETH";
    } else if (CNGN_ADDRESSES.includes(normalizedAddr)) {
      tokenSymbol = "CNGN";
    }
  }
  
  // Determine token decimals
  const decimals = getTokenDecimals(
    tokenMetadata?.decimals ?? null,
    tokenSymbol ?? null,
    tokenAddress ?? undefined
  );
  
  // Normalize amount
  // For offramp transactions, amount is already in human-readable format (no decimals needed)
  const rawAmount = Number(tx.amount) || 0;
  const normalizedAmount = type === "offramp" ? rawAmount : rawAmount / (10 ** decimals);
  
  return {
    id: String(tx.id),
    type,
    status,
    amount: tx.amount,
    normalizedAmount,
    tokenAddress,
    tokenSymbol,
    tokenDecimals: decimals,
    transactionHash: String(tx.transactionHash),
    walletType: tx.walletType,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
    remark: tx.remark,
    transactionNo: tx.transactionNo,
    receiver: tx.receiver,
  };
}

/**
 * Check if token is cNGN
 */
export function isCngnToken(tokenAddress: string | null): boolean {
  if (!tokenAddress) return false;
  const normalized = tokenAddress.toLowerCase().trim();
  return CNGN_ADDRESSES.includes(normalized) || CNGN_ADDRESSES.some(addr => normalized === `0x${addr}`);
}

