import { TokenPriceResult, TokenPriceRequest, makeDextoolsPriceKey } from "./dextools";
import { DextoolsChainId } from "./dextoolsChains";

const CACHE_KEY = "dextools_price_cache";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedPrice {
  price: TokenPriceResult;
  timestamp: number;
}

interface PriceCache {
  [key: string]: CachedPrice;
}

/**
 * Get cached prices from localStorage
 */
function getCache(): PriceCache {
  if (typeof window === "undefined") return {};
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    return JSON.parse(cached) as PriceCache;
  } catch {
    return {};
  }
}

/**
 * Save prices to localStorage cache
 */
function setCache(cache: PriceCache): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore localStorage errors (quota exceeded, etc.)
  }
}

/**
 * Check if a cached price is still valid (within 5 minutes)
 */
function isCacheValid(cached: CachedPrice): boolean {
  const now = Date.now();
  return (now - cached.timestamp) < CACHE_DURATION_MS;
}

/**
 * Get cached price for a token if it exists and is still valid
 */
export function getCachedPrice(
  chain: DextoolsChainId | string,
  address: string
): TokenPriceResult | null {
  const key = makeDextoolsPriceKey(chain as DextoolsChainId, address);
  const cache = getCache();
  const cached = cache[key];
  
  if (!cached) return null;
  if (!isCacheValid(cached)) return null;
  
  return cached.price;
}

/**
 * Cache a price for a token
 */
export function setCachedPrice(
  chain: DextoolsChainId | string,
  address: string,
  price: TokenPriceResult
): void {
  const key = makeDextoolsPriceKey(chain as DextoolsChainId, address);
  const cache = getCache();
  
  cache[key] = {
    price,
    timestamp: Date.now(),
  };
  
  setCache(cache);
}

/**
 * Cache multiple prices at once
 */
export function setCachedPrices(
  prices: Record<string, TokenPriceResult>
): void {
  const cache = getCache();
  const now = Date.now();
  
  Object.entries(prices).forEach(([key, price]) => {
    cache[key] = {
      price,
      timestamp: now,
    };
  });
  
  setCache(cache);
}

/**
 * Filter tokens to only return those that need fetching (missing or stale)
 */
export function filterTokensNeedingFetch(
  tokens: TokenPriceRequest[]
): TokenPriceRequest[] {
  return tokens.filter((token) => {
    const cached = getCachedPrice(token.chain, token.address);
    return cached === null; // Only fetch if not cached or stale
  });
}

/**
 * Get all cached prices for given tokens (even if stale)
 */
export function getCachedPricesForTokens(
  tokens: TokenPriceRequest[]
): Record<string, TokenPriceResult> {
  const result: Record<string, TokenPriceResult> = {};
  
  tokens.forEach((token) => {
    const key = makeDextoolsPriceKey(token.chain as any, token.address);
    const cached = getCachedPrice(token.chain, token.address);
    if (cached) {
      result[key] = cached;
    }
  });
  
  return result;
}
