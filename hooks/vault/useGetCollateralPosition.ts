import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";


export interface CollateralPosition {
  address: string | number | bigint;
  amount: string | number;
  usdValue: string | number;
  cf: string | number;
  symbol: string;
  decimals: number;
  name: string;
}



const useGetCollateralPosition = () => {
  return useQuery<CollateralPosition[], Error>({
    queryKey: ["collateral_positions"],
    queryFn: () =>
      getFetch2<CollateralPosition[]>(`/lending/collateral-positions`).then((res) => res),
    staleTime: Infinity,      
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
};

export default useGetCollateralPosition;