import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";

export interface LinkedAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  bankCode: string;
  bankType: string;
  status: string;
  createdAt: string;
}

const useGetLinkedAccounts = () => {
  return useQuery<LinkedAccount[], Error>({
    queryKey: ["linked_accounts"],
    queryFn: async () => {
      return await getFetch2<LinkedAccount[]>("/off-ramp/bank-accounts");
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useGetLinkedAccounts;

