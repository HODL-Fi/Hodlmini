import axios from "axios";
import { envVars } from "../config/envVars";
import { clearAuth } from "../helpers/clearAuth";
import { getPrivyAccessToken, isPrivyAuthenticated } from "../auth/privyToken";

const getBaseURL = () => envVars.api;

// Base (unauthenticated) API instance
export const apiInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Authenticated instance
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
});

// ✅ Attach Authorization header before every request
// Always gets fresh token from Privy if available, falls back to localStorage
axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      // Try to get fresh token from Privy first
      const token = await getPrivyAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
        // Log token usage for onchain operations
        const isOnchainOperation = config.url?.includes('/lending/') || config.url?.includes('/users/send');
        if (isOnchainOperation) {
          console.log(`[API Request] Using access token for onchain operation: ${config.method?.toUpperCase()} ${config.url}`);
          console.log(`[API Request] Token (first 20 chars): ${token.substring(0, 20)}...`);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    // Only handle 401 responses
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");

      // If we have a Privy token but no refresh token, this is a Privy auth error
      // Don't redirect - let the calling code handle the error
      // Privy uses access tokens, not refresh tokens
      if (accessToken && !refreshToken) {
        // This is likely a Privy authentication error - don't auto-redirect
        // The calling code should handle this error appropriately
        return Promise.reject(error);
      }

      // If no refresh token → logout & redirect
      if (!refreshToken) {
        clearAuth();
        window.location.href = "/onboarding";
        return Promise.reject(error);
      }

      try {
        // 🔄 Attempt refresh
        const res = await apiInstance.post("/auth/refresh", { refreshToken });

        // Save new token
        localStorage.setItem("accessToken", res.data.accessToken);

        // Retry original request with new token
        error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axiosInstance(error.config);

      } catch (refreshError) {
        // ❌ Refresh failed → force logout
        clearAuth();
        window.location.href = "/onboarding";
        return Promise.reject(refreshError);
      }
    }

    // Not a 401 → pass through
    return Promise.reject(error);
  }
);

export default axiosInstance;