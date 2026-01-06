import { useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useGoogleSignInAPI } from "./useGoogleSignInAPI";
import { useAuthStore } from "@/stores/useAuthStore";

export function usePrivyLogin() {
  const router = useRouter();
  const { user, getAccessToken, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { mutateAsync: authUser } = useGoogleSignInAPI();
  const { setLoading, setError, setAuth } = useAuthStore();

  const completePrivyLogin = async (country?: string, privyUser?: any) => {
    // Use user from callback if provided, otherwise use hook's user
    // This handles timing issues where onComplete fires before state updates
    const currentUser = privyUser || user;
    
    // Wait a bit for Privy state to update if user not available yet
    if (!currentUser) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Try again after delay
      if (!user && !privyUser) {
        throw new Error("User not authenticated - please try again");
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Get Privy access token
      // getAccessToken() returns the "privy_access_token" from Privy's /oauth/authenticate response
      // This is the token we use for backend authentication
      const privyAccessToken = await getAccessToken();
      
      if (!privyAccessToken) {
        throw new Error("Failed to get Privy access token");
      }

      // Store token in localStorage immediately so axios interceptor can pick it up
      // This must happen BEFORE the API call
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", privyAccessToken);
      }

      // Get user email from Privy user object
      // Email can be in user.email.address or in linkedAccounts (for OAuth)
      let email = currentUser?.email?.address || user?.email?.address;
      
      // If not found, check linkedAccounts (for OAuth logins like Google)
      if (!email) {
        const linkedAccounts = currentUser?.linkedAccounts || user?.linkedAccounts || [];
        const emailAccount = linkedAccounts.find((account: any) => 
          account.type === 'email' || account.type === 'google_oauth' || account.type === 'apple_oauth'
        );
        email = emailAccount?.email || emailAccount?.address;
      }
      
      if (!email) {
        throw new Error("User email not found in user object");
      }

      // Get wallet address (embedded or external)
      // Note: Since embedded wallets are disabled, we may not have a wallet yet
      // The backend will return the evmAddress in the response
      const wallet = wallets.find((w) => w.walletClientType === "privy") || wallets[0];
      const evmAddress = wallet?.address || currentUser?.wallet?.address || user?.wallet?.address || "";

      // Wallet address might not be available if embedded wallets are disabled
      // Backend will create/return the wallet address in the response

      // Call backend API with Privy token
      // Backend uses Privy token for authentication
      // The token will be stored in localStorage by authUserFn, and axiosInstance
      // interceptor will automatically add it to the Authorization header
      const res = await authUser({
        email: email,
        country: country,
        referralCode: "",
        isEmailVerified: true, // Both email OTP and Google OAuth verify email
        privyToken: privyAccessToken, // Privy token (stored in localStorage by authUserFn)
      });
      
      // Token is already stored in localStorage by authUserFn

      // Update auth store with all required data
      // token = Privy token (used by backend for authentication)
      // privyAccessToken = same Privy token (for reference)
      setAuth({
        userId: res.userId,
        evmAddress: res.evmAddress,
        country: country || undefined,
        token: privyAccessToken, // Privy token is the backend auth token
        privyAccessToken: privyAccessToken,
      });

      // Redirect to home
      router.push("/home");
    } catch (err: any) {
      // Extract more detailed error message from backend response
      let errorMessage = "Login failed";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      // Don't throw - let the error be displayed to user
      // throw err;
    } finally {
      setLoading(false);
    }
  };

  return { completePrivyLogin };
}

