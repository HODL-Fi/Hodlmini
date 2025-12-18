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

      const results = await Promise.all(
        tokens.map(async (token) => {
          const key = makeDextoolsPriceKey(token.chain, token.address);
          const metadata = await fetchTokenMetadata(token);
          return [key, metadata] as const;
        })
      );

      return Object.fromEntries(results);
    },
    enabled: tokens.length > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

