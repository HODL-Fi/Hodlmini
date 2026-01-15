import { useAuthStore } from "@/stores/useAuthStore";

export const clearAuth = () => {
  // Remove tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // Clear Zustand store
  useAuthStore.getState().clear();

  // Redirect user to auth page (changed from /onboarding to /auth)
  window.location.href = "/auth";
};