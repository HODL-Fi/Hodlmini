/**
 * Utility to get Privy access token from anywhere in the app
 * This allows axios interceptors and other non-React code to access the token
 */

let getAccessTokenFn: (() => Promise<string | null>) | null = null;
let isAuthenticatedFn: (() => boolean) | null = null;

/**
 * Initialize the token getter (call this from a React component that has access to usePrivy)
 */
export function setPrivyTokenGetter(
  getToken: () => Promise<string | null>,
  isAuthenticated: () => boolean
) {
  getAccessTokenFn = getToken;
  isAuthenticatedFn = isAuthenticated;
}

/**
 * Get the Privy access token
 * Falls back to localStorage if Privy hook is not available
 */
export async function getPrivyAccessToken(): Promise<string | null> {
  // First try to get from Privy hook (always fresh)
  if (getAccessTokenFn && isAuthenticatedFn?.()) {
    try {
      const token = await getAccessTokenFn();
      // Also update localStorage for backwards compatibility
      if (typeof window !== "undefined" && token) {
        localStorage.setItem("accessToken", token);
      }
      return token;
    } catch (error) {
      // Silently fail and fall back to localStorage
    }
  }

  // Fallback to localStorage (for backwards compatibility)
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }

  return null;
}

/**
 * Check if user is authenticated via Privy
 */
export function isPrivyAuthenticated(): boolean {
  return isAuthenticatedFn?.() ?? false;
}

/**
 * Proactively refresh the access token before onchain operations
 * This ensures we have a fresh token before making requests that require onchain authorization
 * @returns The fresh access token, or null if unavailable
 */
export async function refreshAccessTokenForOnchain(): Promise<string | null> {
  // Get fresh token from Privy (this also updates localStorage)
  const token = await getPrivyAccessToken();
  
  if (token) {
    // New access token obtained for onchain operation
  } else {
    console.warn("[Onchain Token Refresh] No access token available for onchain operation");
  }
  
  return token;
}

