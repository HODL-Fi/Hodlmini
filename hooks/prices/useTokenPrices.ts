import { useQuery } from "@tanstack/react-query";
import {
  fetchTokenPrices,
  TokenPriceRequest,
  TokenPriceResult,
} from "@/utils/prices/dextools";

export const useTokenPrices = (tokens: TokenPriceRequest[]) => {
  // Build a stable key from the token list so we don't refetch on every render
  const tokensKey = tokens
    .map((t) => `${t.chain}:${t.address.toLowerCase()}`)
    .sort()
    .join("|");

  return useQuery<Record<string, TokenPriceResult>, Error>({
    queryKey: ["tokenPrices", tokensKey],
    queryFn: () => {
      return fetchTokenPrices(tokens);
    },
    enabled: tokens.length > 0,
    // Data freshness: from 120 sec - cache for 120s
    staleTime: 120_000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};


