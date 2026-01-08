import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";

export interface ExchangeRateResponse {
  rate: string;
  success: boolean;
  message: string;
}

const useGetExchangeRate = (
  tokenSymbol: string | null,
  amount: string,
  currency: string,
  chainId: string | null,
  enabled: boolean = true
) => {
  return useQuery<ExchangeRateResponse, Error>({
    queryKey: ["exchange_rate", tokenSymbol, amount, currency, chainId],
    queryFn: async () => {
      if (!tokenSymbol || !chainId) {
        throw new Error("Token symbol and chain ID are required");
      }
      return await getFetch2<ExchangeRateResponse>(
        `/off-ramp/exchange-rates/${tokenSymbol.toLowerCase()}/${amount}/${currency}/${chainId}`
      );
    },
    enabled: enabled && Boolean(tokenSymbol) && Boolean(chainId) && Boolean(amount),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useGetExchangeRate;

