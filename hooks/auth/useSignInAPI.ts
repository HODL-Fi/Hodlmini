import { useMutation } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";

export type LoginUserRequest = {
  idToken: string;
};

export type LoginUserResponse = {
    status: string;
    message: string;
    data: {
      token: string;
    };
};


const loginUserFn = async (payload: LoginUserRequest): Promise<LoginUserResponse> => {
  const res = await postFetch<LoginUserResponse, LoginUserRequest>("/users/google-signin", payload);
  return res.data;
};

export const useSignInAPI = () => {
  return useMutation<LoginUserResponse, Error, LoginUserRequest>({
    mutationFn: loginUserFn,
  });
};