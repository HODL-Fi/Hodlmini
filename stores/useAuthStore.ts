import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  userId: string | null;
  evmAddress: string | null;
  country: string | null;
  idToken: string | null;

  loading: boolean;
  error: string | null;

  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;

  setAuth: (data: {
    userId: string;
    evmAddress: string;
    country?: string;
    idToken?: string;
  }) => void;

  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      evmAddress: null,
      country: null,
      idToken: null,

      loading: false,
      error: null,

      setLoading: (v) => set({ loading: v }),
      setError: (v) => set({ error: v }),

      setAuth: ({ userId, evmAddress, country, idToken }) =>
        set({
          userId,
          evmAddress,
          country: country ?? null,
          idToken: idToken ?? null,
          loading: false,
          error: null,
        }),

      clear: () =>
        set({
          userId: null,
          evmAddress: null,
          country: null,
          idToken: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "auth-storage", 
    }
  )
);