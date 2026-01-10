import { useQuery } from "@tanstack/react-query";
import {
  fetchTokenMetadata,
  TokenPriceRequest,
  TokenMetadata,
  makeDextoolsPriceKey,
} from "@/utils/prices/dextools";

// Fetch metadata for a single token
export const useTokenMetadata = (token: TokenPriceRequest | null) => {
  return useQuery<TokenMetadata | null, Error>({
    queryKey: ["tokenMetadata", token],
    queryFn: () => (token ? fetchTokenMetadata(token) : Promise.resolve(null)),
    enabled: !!token,
    staleTime: Infinity, // Token metadata rarely changes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// Fetch metadata for multiple tokens
export const useTokenMetadataBatch = (tokens: TokenPriceRequest[]) => {
  return useQuery<Record<string, TokenMetadata | null>, Error>({
    queryKey: ["tokenMetadataBatch", tokens],
    queryFn: async () => {
      if (tokens.length === 0) return {};

      // Process sequentially to respect rate limits (1 req/sec, 1 concurrent)
      const results: [string, TokenMetadata | null][] = [];
      
      for (const token of tokens) {
        const key = makeDextoolsPriceKey(token.chain, token.address);
        const metadata = await fetchTokenMetadata(token);
        results.push([key, metadata]);
      }

      return Object.fromEntries(results);
    },
    enabled: tokens.length > 0,
    staleTime: Infinity, // Token metadata rarely changes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

