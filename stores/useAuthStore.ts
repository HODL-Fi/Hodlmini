// stores/useAuthStore.ts
import { create } from "zustand";

export interface AuthUser {
  email: string;
  name: string;
  profileImage: string;
  authConnection: string;
  userId: string;
}

interface AuthState {
  user: AuthUser | null;
  idToken: string | null;

  loading: boolean;
  error: string | null;

  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setAuth: (user: AuthUser, idToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  idToken: null,

  loading: false,
  error: null,

  setLoading: (v) => set({ loading: v }),
  setError: (v) => set({ error: v }),
  setAuth: (user, idToken) => set({ user, idToken, loading: false, error: null }),
  clear: () => set({ user: null, idToken: null, loading: false, error: null }),
}));