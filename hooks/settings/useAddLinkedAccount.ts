import { useMutation } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";

export interface AddLinkedAccountRequest {
  accountNumber: string;
  bankCode: string;
  currency: string;
  bankType: string;
}

export interface AddLinkedAccountResponse {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  bankCode: string;
  bankType: string;
  status: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    privyId: string;
    username: string | null;
    kycStatus: string;
    country: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    fcmToken: string | null;
    wallets: Array<{
      id: string;
      address: string;
      privyId: string;
      network: string;
      createdAt: string;
      updatedAt: string;
    }>;
    referralCode: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
}

export interface AddLinkedAccountError {
  error: string;
  message: string;
  statusCode: number;
}

const addLinkedAccountFn = async (
  payload: AddLinkedAccountRequest
): Promise<AddLinkedAccountResponse> => {
  const res = await postFetch<AddLinkedAccountResponse, AddLinkedAccountRequest>(
    "/off-ramp/bank-accounts",
    payload
  );
  return res.data;
};

export const useAddLinkedAccount = () => {
  return useMutation<AddLinkedAccountResponse, AddLinkedAccountError, AddLinkedAccountRequest>({
    mutationFn: addLinkedAccountFn,
  });
};

