import { useMutation } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";

export type withdrawColRequest = {
  tokenAddress: string;
  amount: string;
  chainId: string;
};

export interface withdrawColResponse {
  id: string;
  transactionHash: string;
  walletType: string;
  transactionType: string;
  amount: number;
  remark: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface withdrawColError {
  error: string;
  message: string;
  details: {
    name: string;
    args: Record<string, unknown>;
  };
  statusCode: number;
}



const withdrawCollateralFn = async (payload: withdrawColRequest): Promise<withdrawColResponse> => {
  const res = await postFetch<withdrawColResponse, withdrawColRequest>("/lending/withdraw-collateral", payload);
  return res.data;  // backend wraps response under `data`
};

export const useWithdrawCollateral = () => {
  return useMutation<withdrawColResponse, withdrawColError, withdrawColRequest>({
    mutationFn: withdrawCollateralFn,
  });
};
