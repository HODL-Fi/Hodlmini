import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";


export interface AccountValue {
  collateralValue: number | string;
  debtValue: number | string;
  availableToBorrow: number | string;
}



const useGetAccountValue = () => {
  return useQuery<AccountValue, Error>({
    queryKey: ["account_value"],
    queryFn: () =>
      getFetch2<AccountValue>(`/lending/account-value`).then((res) => res),
    staleTime: Infinity,      
    refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    retry: false
  });
};

export default useGetAccountValue;
