import axios from "axios";
import { envVars } from "../config/envVars";
import { clearAuth } from "../helpers/clearAuth";

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
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }    return config;
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

      // If no refresh token → logout & redirect
      if (!refreshToken) {
        clearAuth();
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
        return Promise.reject(refreshError);
      }
    }

    // Not a 401 → pass through
    return Promise.reject(error);
  }
);

export default axiosInstance;