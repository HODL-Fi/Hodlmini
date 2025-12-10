import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";


export interface TxHistory {
  id: string | number;
  transactionType: string;
  remark: string | number;
  transactionHash: string | number;
  amount: string;
  status: number;
  walletType: string;
  createdAt: string;
  updatedAt: string;
  transactionNo?: string;
  receiver?: {
    name: string;
    accountNumber: string;
    bankName: string;
  };
}



const useGetUserTxHistory = () => {
  return useQuery<TxHistory[], Error>({
    queryKey: ["tx_history"],
    queryFn: () =>
      getFetch2<TxHistory[]>(`/users/history`).then((res) => res),
    staleTime: Infinity,      
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
};

export default useGetUserTxHistory;