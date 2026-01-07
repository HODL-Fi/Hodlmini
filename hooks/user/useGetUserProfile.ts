import { useQuery } from "@tanstack/react-query";
import { getFetch2 } from "@/utils/api/fetch";

export interface UserProfile {
  id: string;
  email: string;
  country: string;
  walletAddress: string;
  username: string | null;
  name?: string | null;
  kycStatus?: string | null;
}

const useGetUserProfile = () => {
  return useQuery<UserProfile, Error>({
    queryKey: ["user_profile"],
    queryFn: async () => {
      return await getFetch2<UserProfile>("/users/profile");
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
};

export default useGetUserProfile;

