import { useQuery } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";

export interface HealthFactorEntry {
  healthFactor: number | string;
}

export interface HealthFactorByChain {
  [chainId: string]: HealthFactorEntry;
}

const useGetHealthFactor = (chainIds: Array<number | string> = []) => {
  const chainIdStrings = chainIds.map(String).sort();

  return useQuery<HealthFactorByChain, Error>({
    queryKey: ["health_factors", ...chainIdStrings],
    queryFn: async () => {
      if (chainIdStrings.length === 0) return {};
      const res = await postFetch<HealthFactorByChain, { chainIds: string[] }>(
        "/lending/health-factors",
        { chainIds: chainIdStrings }
      );
      return res.data;
    },
    enabled: chainIdStrings.length > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useGetHealthFactor;


