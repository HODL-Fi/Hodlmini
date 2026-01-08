import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";

export interface SupportedInstitution {
  name: string;
  code: string;
  type: string;
}

export interface SupportedInstitutionsResponse {
  institutions: SupportedInstitution[];
  success: boolean;
  message: string;
}

const useGetSupportedInstitutions = (currency: string) => {
  return useQuery<SupportedInstitutionsResponse, Error>({
    queryKey: ["supported_institutions", currency],
    queryFn: async () => {
      return await getFetch2<SupportedInstitutionsResponse>(
        `/off-ramp/supported-institutions/${currency}`
      );
    },
    enabled: Boolean(currency),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useGetSupportedInstitutions;

