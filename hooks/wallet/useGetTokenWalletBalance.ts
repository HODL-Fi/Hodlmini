import { useQuery } from "@tanstack/react-query";
import { getFetch2, postFetch } from "@/utils/api/fetch";


export interface TokenBalance {
  decimals: number;
  logo: string;
  name: string;
  symbol: string;
  balance: string;
  contractAddress: string;
}



const useGetTokenWalletBalance = (chainId: number | string) => {
  return useQuery<TokenBalance[], Error>({
    queryKey: ["wallet_balance", chainId],
    queryFn: () =>
      getFetch2<TokenBalance[]>(`/users/balances/${chainId}`).then((res) => res),
    enabled: !!chainId,            // don’t run unless chainId is provided
    staleTime: Infinity,      
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useGetTokenWalletBalance;

export const useGetAllChainBalances = (chainIds: Array<number | string>) => {
  return useQuery<Record<string, TokenBalance[]>, Error>({
    queryKey: ["wallet_balance", "all", ...chainIds.sort()],
    queryFn: async () => {
      const response = await postFetch<Record<string, TokenBalance[]>, { chainIds: string[] }>(
        "/users/balances",
        { chainIds: chainIds.map(String) }
      );
      return response.data;
    },
    enabled: chainIds.length > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};