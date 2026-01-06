import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AccountBalances {
  walletUsd: number;
  loanUsd: number;
  collateralUsd: number;
  availableToBorrowUsd: number;
  lastUpdated: number; // timestamp
}

interface AccountBalancesState {
  balances: AccountBalances | null;
  setBalances: (balances: Omit<AccountBalances, 'lastUpdated'>) => void;
  clear: () => void;
}

export const useAccountBalancesStore = create<AccountBalancesState>()(
  persist(
    (set) => ({
      balances: null,
      setBalances: (balances: Omit<AccountBalances, 'lastUpdated'>) =>
        set({
          balances: {
            ...balances,
            lastUpdated: Date.now(),
          },
        }),
      clear: () => set({ balances: null }),
    }),
    {
      name: "account-balances-storage",
    }
  )
);

