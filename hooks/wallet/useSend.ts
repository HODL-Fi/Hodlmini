import { useMutation } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";
import { refreshAccessTokenForOnchain } from "@/utils/auth/privyToken";

export interface SendRequest {
  chainId: string;
  toAddress: string;
  tokenAddress: string;
  /**
   * Amount in smallest units (token decimals), sent as a string to avoid precision loss.
   */
  amount: string;
}

export interface SendResponse {
  id?: string;
  transactionHash?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  from?: string;
  to?: string;
  amount?: number | string;
}

export interface SendError {
  error: string;
  message: string;
  statusCode: number;
}

const sendFn = async (payload: SendRequest): Promise<SendResponse> => {
  // Refresh token proactively before onchain operation
  const token = await refreshAccessTokenForOnchain();
  
  const res = await postFetch<SendResponse, SendRequest>("/users/send", payload);
  return res.data ?? (res as any);
};

export const useSend = () => {
  return useMutation<SendResponse, SendError, SendRequest>({
    mutationFn: sendFn,
  });
};


