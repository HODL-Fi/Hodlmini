import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";
import { refreshAccessTokenForOnchain } from "@/utils/auth/privyToken";

export interface DepositColResponse {
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

export interface DepositColError {
  error: string;
  message: string;
  details: {
    name: string;
    args: Record<string, unknown>;
  };
  statusCode: number;
}

export type DepositColRequest = {
  tokenAddress: string;
  amount: string;
  chainId: string;
};

const depositCollateralFn = async (
  payload: DepositColRequest
): Promise<DepositColResponse> => {
  // Refresh token proactively before onchain operation
  const token = await refreshAccessTokenForOnchain();
  console.log("[Deposit Collateral] Starting onchain transaction with refreshed token");
  
  const res = await postFetch<DepositColResponse, DepositColRequest>(
    "/lending/deposit-collateral",
    payload
  );

  return res.data; // backend wraps response under `data`
};

export const useDepositCollateral = () => {
  const queryClient = useQueryClient();

  return useMutation<DepositColResponse, DepositColError, DepositColRequest>({
    mutationFn: depositCollateralFn,
    onSuccess: () => {
      // Invalidate vault-related queries so balances, positions, and health refresh
      queryClient.invalidateQueries({ queryKey: ["collateral_positions"] });
      queryClient.invalidateQueries({ queryKey: ["account_value"] });
      queryClient.invalidateQueries({ queryKey: ["health_factors"] });
      queryClient.invalidateQueries({ queryKey: ["wallet_balance"] });
    },
  });
};