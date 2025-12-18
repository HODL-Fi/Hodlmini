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
    queryFn: () => fetchTokenPrices(tokens),
    enabled: tokens.length > 0,
    // cache for 30s but don't poll; caller can refetch on demand if needed
    staleTime: 30_000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};


