import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/api/apiInstance";

export type AuthUserRequest = {
  email: string;
  country?: string;
  referralCode?: string;
  isEmailVerified: boolean;
  privyToken: string; // Privy access token - will be stored in localStorage before call
};

export type AuthUserResponse = {
  userId: string;
  evmAddress: string;
};

const authUserFn = async (payload: AuthUserRequest): Promise<AuthUserResponse> => {
  // Store Privy token in localStorage first (axiosInstance interceptor will pick it up)
  // This ensures the Authorization header is set correctly
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", payload.privyToken);
  }
  
  // Make the API call - axiosInstance interceptor will automatically add Authorization header
  const res = await axiosInstance.post<AuthUserResponse>("/users/auth", {
    email: payload.email,
    country: payload.country,
    referralCode: payload.referralCode,
    isEmailVerified: payload.isEmailVerified,
  });
  
  return res.data;
};

export const useGoogleSignInAPI = () => {
  return useMutation<AuthUserResponse, Error, AuthUserRequest>({
    mutationFn: authUserFn,
  });
};