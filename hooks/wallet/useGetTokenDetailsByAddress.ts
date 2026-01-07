import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";


export interface TokenDetails {
  usdValue: string | number;
  symbol: string;
  decimals: number;
  name: string;
}



const useGetTokenDetailsByAddress = (tokenAddress : string) => {
  return useQuery<TokenDetails, Error>({
    queryKey: ["token_details", tokenAddress],
    queryFn: () =>
      getFetch2<TokenDetails>(`/lending/token-details/${tokenAddress}`).then((res) => res),
    staleTime: Infinity,      
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
};

export default useGetTokenDetailsByAddress;