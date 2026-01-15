import { DEXTOOLS_CHAINS, DextoolsChainId } from "./dextoolsChains";
import { getTokenDecimals } from "@/utils/constants/tokenDecimals";
import {
  getCachedPrice,
  setCachedPrice,
  filterTokensNeedingFetch,
  getCachedPricesForTokens,
} from "./priceCache";

export interface TokenPriceResult {
  price: number;
  price24h: number;
  variation24h: number;
}

export interface TokenPriceRequest {
  chain: DextoolsChainId;
  address: string;
}

const DEXTOOLS_BASE_URL = "https://public-api.dextools.io/trial";

// Rate limiter: 1 request per second, 1 concurrent request
type QueuedRequest<T> = {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
};

class RateLimiter {
  private queue: QueuedRequest<any>[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minDelay = 1000; // 1 second between requests

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      // Wait if needed to maintain 1 req/sec rate
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
      }

      const item = this.queue.shift()!;
      this.lastRequestTime = Date.now();

      try {
        const result = await item.fn();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }

    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

const getApiKey = () => {
  const key = process.env.NEXT_PUBLIC_DEXTOOLS_API_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_DEXTOOLS_API_KEY");
  }
  return key;
};

async function fetchTokenPriceInternal(
  { chain, address }: TokenPriceRequest
): Promise<TokenPriceResult> {
  const res = await fetch(
    `${DEXTOOLS_BASE_URL}/v2/token/${chain}/${address}/price`,
    {
      headers: {
        "X-API-KEY": getApiKey(),
      },
      // DEXTools is public; avoid sending cookies accidentally
      credentials: "omit",
    }
  );

  if (!res.ok) {
    throw new Error(`Dextools price failed: ${res.status} ${res.statusText}`);
  }

  const raw = await res.json();
  const data = raw?.data ?? raw; // handle both { statusCode, data } and plain TokenPrice

  return {
    price: data.price ?? 0,
    price24h: data.price24h ?? 0,
    variation24h: data.variation24h ?? 0,
  };
}

export async function fetchTokenPrice(
  request: TokenPriceRequest
): Promise<TokenPriceResult> {
  return rateLimiter.execute(() => fetchTokenPriceInternal(request));
}

export async function fetchTokenPrices(
  tokens: TokenPriceRequest[]
): Promise<Record<string, TokenPriceResult>> {
  if (tokens.length === 0) return {};

  // Start with cached prices (valid ones)
  const cachedPrices = getCachedPricesForTokens(tokens);
  const results: Record<string, TokenPriceResult> = { ...cachedPrices };

  // Filter to only fetch tokens that need updating
  const tokensToFetch: TokenPriceRequest[] = filterTokensNeedingFetch(tokens);

  if (tokensToFetch.length === 0) {
    // All prices are cached and valid
    return results;
  }

  // Process sequentially to respect rate limits (1 req/sec, 1 concurrent)
  for (const t of tokensToFetch) {
    const key = `${t.chain}:${t.address.toLowerCase()}`;
    try {
      const price = await fetchTokenPrice(t);
      results[key] = price;
      // Cache the newly fetched price
      setCachedPrice(t.chain, t.address, price);
    } catch (error) {
      // On failure, surface a zeroed price instead of breaking the whole query
      const zeroPrice = { price: 0, price24h: 0, variation24h: 0 };
      results[key] = zeroPrice;
      console.error("[DEXTools] Price fetch failed:", { key, error });
      // Don't cache failures
    }
  }

  return results;
}

// Helper to build the DEXTools key we use in maps
export const makeDextoolsPriceKey = (chain: DextoolsChainId, address: string) =>
  `${chain}:${address.toLowerCase()}`;

// Helper to map our hex chainId to DEXTools chain id (or undefined if unsupported)
export const mapHexChainIdToDextools = (hexChainId: string): DextoolsChainId | undefined =>
  DEXTOOLS_CHAINS[hexChainId];

// Token metadata from DEXTools (includes logo)
export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  logo: string;
  decimals: number;
}

async function fetchTokenMetadataInternal(
  { chain, address }: TokenPriceRequest
): Promise<TokenMetadata | null> {
  try {
    const res = await fetch(
      `${DEXTOOLS_BASE_URL}/v2/token/${chain}/${address}`,
      {
        headers: {
          "X-API-KEY": getApiKey(),
        },
        credentials: "omit",
      }
    );

    if (!res.ok) {
      return null;
    }

    const raw = await res.json();
    const data = raw?.data ?? raw;

    if (!data || !data.logo) {
      return null;
    }

    return {
      address: data.address ?? address,
      name: data.name ?? "",
      symbol: data.symbol ?? "",
      logo: data.logo,
      decimals: getTokenDecimals(data.decimals, data.symbol, address),
    };
  } catch {
    return null;
  }
}

export async function fetchTokenMetadata(
  request: TokenPriceRequest
): Promise<TokenMetadata | null> {
  return rateLimiter.execute(() => fetchTokenMetadataInternal(request));
}


