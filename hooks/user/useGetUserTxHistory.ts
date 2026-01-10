import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";

export interface TxHistory {
  id: string;
  transactionType: "BORROW" | "DEPOSIT" | "WITHDRAW" | "SWAP";
  remark: string;
  transactionHash: string;
  amount: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  walletType: string;
  createdAt: string;
  updatedAt: string;
  transactionNo?: string;
  collateralAssets?: string[];
  receiver?: {
    name: string;
    accountNumber: string;
    bankName: string;
    currency?: string;
  };
}

const useGetUserTxHistory = () => {
  return useQuery<TxHistory[], Error>({
    queryKey: ["tx_history"],
    queryFn: async () => {
      return await getFetch2<TxHistory[]>("/users/history");
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
};

export default useGetUserTxHistory;