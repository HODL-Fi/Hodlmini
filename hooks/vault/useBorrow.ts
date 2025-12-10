/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";

export type BorrowRequest = {
  tokenAddress: string;
  amount: string;
  chainId: string;
  tenureSeconds: number;
  collaterals: string[];
  offramp: boolean;
  currency?: string; // base on offramp choice
  institutionId?: string; // base on offramp choice
};

export interface BorrowSuccessResponse {
  id: string;
  transactionHash: string;
  walletType: string;
  transactionType: string;
  transactionNo?: string; // base on offramp choice
  collateralAsset: string[];
  receiver?: {
    name: string;
    accountNumber: string;
    bankName: string;
  }; // base on offramp choice
  user: {
    id: string;
  };
  amount: number;
  remark: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowErrorResponse {
  error: string;
  message: string;
  details: {
    name: string;
    args: Record<string, any>;
  };
  statusCode: number;
}

const borrowFn = async (payload: BorrowRequest): Promise<BorrowSuccessResponse> => {
  const res = await postFetch<BorrowSuccessResponse, BorrowRequest>("/lending/borrow", payload);
  return res.data;
};

export const useBorrow = () => {
  return useMutation<BorrowSuccessResponse, BorrowErrorResponse, BorrowRequest>({
    mutationFn: borrowFn,
  });
};