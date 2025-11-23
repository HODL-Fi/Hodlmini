import axios from "axios";
import { envVars } from "../config/envVars";

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
      

      let storedToken: string | null = null;
      storedToken = localStorage.getItem("accessToken");

      let accessToken: string | null = null;
      let tokenType: string = "Bearer";

      if (storedToken) {
        try {
          const parsed = JSON.parse(storedToken);
          accessToken = parsed?.access_token ?? null;
          tokenType = parsed?.token_type ?? "Bearer";
        } catch {
          accessToken = storedToken;
          tokenType = "Bearer";
        }
      }

      if (accessToken) {
        config.headers.Authorization = `${tokenType} ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const isLoggingOut = sessionStorage.getItem("isLoggingOut") === "true";
      if (error.response?.status === 401 && !isLoggingOut) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");

        // window.location.href = "/auth/signin"; 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;