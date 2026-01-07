import { useQuery } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";


export interface AccountValue {
  collateralValue: number | string;
  debtValue: number | string;
  availableToBorrow: number | string;
}

export interface AccountValueByChain {
  [chainId: string]: AccountValue;
}

const useGetAccountValue = (chainIds: Array<number | string> = []) => {
  return useQuery<AccountValueByChain, Error>({
    queryKey: ["account_value", ...chainIds.sort()],
    queryFn: async () => {
      if (chainIds.length === 0) return {};
      const response = await postFetch<AccountValueByChain, { chainIds: string[] }>(
        "/lending/account-values",
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

export default useGetAccountValue;
