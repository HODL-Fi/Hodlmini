import { useQuery } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";


export interface CollateralPosition {
  address: string | number | bigint;
  amount: string | number;
  usdValue: string | number;
  cf: string | number;
  symbol: string;
  decimals: number;
  name: string;
}

export type CollateralPositionsByChain = Record<string, CollateralPosition[]>;



const useGetCollateralPosition = (chainIds: Array<string | number>) => {
  const chainIdStrings = chainIds.map(String).sort();

  return useQuery<CollateralPositionsByChain, Error>({
    queryKey: ["collateral_positions", ...chainIdStrings],
    queryFn: async () => {
      const res = await postFetch<CollateralPositionsByChain, { chainIds: string[] }>(
        "/lending/collateral-positions",
        { chainIds: chainIdStrings }
      );
      return res.data;
    },
    enabled: chainIdStrings.length > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // retry: false,
  });
};

export default useGetCollateralPosition;