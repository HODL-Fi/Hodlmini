/**
 * Hook to sync Privy's getAccessToken with the global token utility
 * This allows axios interceptors to always get fresh tokens
 */
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { setPrivyTokenGetter } from "@/utils/auth/privyToken";

export function usePrivyTokenSync() {
  const { getAccessToken, authenticated } = usePrivy();

  useEffect(() => {
    // Guard against undefined getAccessToken (Privy not ready)
    if (!getAccessToken || typeof getAccessToken !== 'function') {
      return;
    }
    
    // Sync the getAccessToken function so it can be used by axios interceptors
    setPrivyTokenGetter(
      () => getAccessToken(),
      () => authenticated ?? false
    );
  }, [getAccessToken, authenticated]);
}

