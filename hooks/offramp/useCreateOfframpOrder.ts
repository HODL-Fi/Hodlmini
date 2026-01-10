import { useMutation } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";

export interface CreateOfframpOrderRequest {
  tokenSymbol: string;
  tokenAddress: string;
  amount: string;
  currency: string;
  chainId: string;
  accountId: string;
  memo: string;
}

export interface CreateOfframpOrderResponse {
  id: string;
  collateralAssets: string[];
  transactionType: string;
  remark: string;
  transactionNo: string;
  transactionHash: string;
  walletType: string;
  user: {
    id: string;
  };
  receiver: {
    name: string;
    accountNumber: string;
    bankName: string;
    currency: string;
  };
  amount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const createOfframpOrderFn = async (
  payload: CreateOfframpOrderRequest
): Promise<CreateOfframpOrderResponse> => {
  const res = await postFetch<CreateOfframpOrderResponse, CreateOfframpOrderRequest>(
    "/off-ramp/create-order",
    payload
  );
  return res.data;
};

export const useCreateOfframpOrder = () => {
  return useMutation<CreateOfframpOrderResponse, Error, CreateOfframpOrderRequest>({
    mutationFn: createOfframpOrderFn,
  });
};

