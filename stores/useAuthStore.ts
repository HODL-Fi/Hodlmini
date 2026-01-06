import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  userId: string | null;
  evmAddress: string | null;
  country: string | null;
  token: string | null; // Backend access token
  privyAccessToken: string | null; // Privy access token

  loading: boolean;
  error: string | null;

  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;

  setAuth: (data: {
    userId: string;
    evmAddress: string;
    country?: string;
    token?: string;
    privyAccessToken?: string;
  }) => void;

  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      evmAddress: null,
      country: null,
      token: null,
      privyAccessToken: null,

      loading: false,
      error: null,

      setLoading: (v) => set({ loading: v }),
      setError: (v) => set({ error: v }),

      setAuth: ({ userId, evmAddress, country, token, privyAccessToken }) =>
        set({
          userId,
          evmAddress,
          country: country ?? null,
          token: token ?? null,
          privyAccessToken: privyAccessToken ?? null,
          loading: false,
          error: null,
        }),

      clear: () =>
        set({
          userId: null,
          evmAddress: null,
          country: null,
          token: null,
          privyAccessToken: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "auth-storage", 
    }
  )
);