import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";


export interface HealthFactor {
  healthFactor: number | string;
}



const useGetHealthFactor = () => {
  return useQuery<HealthFactor, Error>({
    queryKey: ["health_factor"],
    queryFn: () =>
      getFetch2<HealthFactor>(`/lending/health-factor`).then((res) => res),
    staleTime: Infinity,      
    refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    retry: false
  });
};

export default useGetHealthFactor;
