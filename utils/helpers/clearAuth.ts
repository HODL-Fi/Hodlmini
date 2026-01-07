import { useAuthStore } from "@/stores/useAuthStore";

export const clearAuth = () => {
  // Remove tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // Clear Zustand store
  useAuthStore.getState().clear();

  // Redirect user
  window.location.href = "/onboarding";
};