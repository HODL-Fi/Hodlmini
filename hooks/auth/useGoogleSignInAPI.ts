import { useMutation } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";

export type LoginUserRequest = {
  idToken: string;
  country?: string;
  referralCode?: string;
};

export type LoginUserResponse = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  evmAddress: string; 
};


const loginUserFn = async (payload: LoginUserRequest): Promise<LoginUserResponse> => {
  const res = await postFetch<LoginUserResponse, LoginUserRequest>("/users/google-signin", payload);
  return res.data;
};

export const useGoogleSignInAPI = () => {
  return useMutation<LoginUserResponse, Error, LoginUserRequest>({
    mutationFn: loginUserFn,
  });
};