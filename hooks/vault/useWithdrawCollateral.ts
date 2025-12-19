import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  return useMutation<withdrawColResponse, withdrawColError, withdrawColRequest>({
    mutationFn: withdrawCollateralFn,
    onSuccess: () => {
      // Invalidate vault-related queries so balances, positions, and health refresh
      queryClient.invalidateQueries({ queryKey: ["collateral_positions"] });
      queryClient.invalidateQueries({ queryKey: ["account_value"] });
      queryClient.invalidateQueries({ queryKey: ["health_factors"] });
      queryClient.invalidateQueries({ queryKey: ["wallet_balance"] });
    },
  });
};
