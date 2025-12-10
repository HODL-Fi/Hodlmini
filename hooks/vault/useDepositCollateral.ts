import { useMutation } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";

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
  const res = await postFetch<DepositColResponse, DepositColRequest>(
    "/lending/deposit-collateral",
    payload
  );

  return res.data; // backend wraps response under `data`
};

export const useDepositCollateral = () => {
  return useMutation<DepositColResponse, DepositColError, DepositColRequest>({
    mutationFn: depositCollateralFn,
  });
};