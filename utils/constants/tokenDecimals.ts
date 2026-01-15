import { CNGN_BASE_ADDRESS, CNGN_ADDRESSES, CNGN_DECIMALS } from "./cngn";

/**
 * Special address used to represent Ether (ETH) in transaction history
 */
export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000001";

/**
 * Get known token decimals for tokens where the API doesn't provide decimals.
 * Returns null if the token is not in the known list.
 */
export function getKnownTokenDecimals(symbol: string | null | undefined): number | null {
  if (!symbol) return null;
  
  const symUpper = symbol.toUpperCase();
  
  // Ether has 18 decimals
  if (symUpper === "ETH" || symUpper === "ETHER") {
    return 18;
  }
  
  // Stablecoins typically have 6 decimals
  if (symUpper === "USDT" || symUpper === "USDC" || symUpper === "CNGN") {
    return 6;
  }
  
  return null;
}

/**
 * Get known token decimals by address (for tokens identified by contract address).
 * Returns null if the address is not in the known list.
 */
export function getKnownTokenDecimalsByAddress(address: string | null | undefined): number | null {
  if (!address) return null;
  
  const addrLower = String(address).trim().toLowerCase();
  const normalizedAddr = addrLower.startsWith('0x') ? addrLower : `0x${addrLower}`;
  
  // Ether has a special address
  const etherAddr = ETHER_ADDRESS.toLowerCase();
  if (normalizedAddr === etherAddr) {
    return 18; // ETH has 18 decimals
  }
  
  // cNGN has known addresses on multiple chains
  if (CNGN_ADDRESSES.includes(normalizedAddr)) {
    return CNGN_DECIMALS; // 6
  }
  
  return null;
}

/**
 * Get token decimals with fallback chain:
 * 1. API-provided decimals
 * 2. Known token decimals by symbol
 * 3. Known token decimals by address
 * 4. Default fallback (18)
 */
export function getTokenDecimals(
  apiDecimals: number | null | undefined,
  symbol?: string | null | undefined,
  address?: string | null | undefined,
  defaultDecimals: number = 18
): number {
  // Use API decimals if provided
  if (apiDecimals != null && Number.isFinite(apiDecimals) && apiDecimals > 0) {
    return apiDecimals;
  }
  
  // Try known token decimals by symbol
  const knownBySymbol = getKnownTokenDecimals(symbol);
  if (knownBySymbol != null) {
    return knownBySymbol;
  }
  
  // Try known token decimals by address
  const knownByAddress = getKnownTokenDecimalsByAddress(address);
  if (knownByAddress != null) {
    return knownByAddress;
  }
  
  // Default fallback
  return defaultDecimals;
}

