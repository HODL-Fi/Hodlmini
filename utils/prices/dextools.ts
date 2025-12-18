import { DEXTOOLS_CHAINS, DextoolsChainId } from "./dextoolsChains";

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

const getApiKey = () => {
  const key = process.env.NEXT_PUBLIC_DEXTOOLS_API_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_DEXTOOLS_API_KEY");
  }
  return key;
};

export async function fetchTokenPrice(
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

export async function fetchTokenPrices(
  tokens: TokenPriceRequest[]
): Promise<Record<string, TokenPriceResult>> {
  if (tokens.length === 0) return {};

  const results = await Promise.all(
    tokens.map(async (t) => {
      const key = `${t.chain}:${t.address.toLowerCase()}`;
      try {
        const price = await fetchTokenPrice(t);
        return [key, price] as const;
      } catch {
        // On failure, surface a zeroed price instead of breaking the whole query
        return [key, { price: 0, price24h: 0, variation24h: 0 }] as const;
      }
    })
  );

  return Object.fromEntries(results);
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

export async function fetchTokenMetadata(
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
      decimals: data.decimals ?? 18,
    };
  } catch {
    return null;
  }
}


