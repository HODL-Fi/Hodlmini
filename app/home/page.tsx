"use client";

import HomeTopNav from "@/components/HomeTopNav";
import { useAuthStore } from "@/stores/useAuthStore";
import { generateHandleFromUserId } from "@/utils/username";
import { AccountsScroller } from "@/components/accounts";
import GlobalAccountsScroller from "@/components/accounts/GlobalAccountsScroller";
import { WalletIcon } from "@customIcons";
import { VaultIcon } from "@customIcons";
import BalanceRow from "@/components/BalanceRow";
import { VisibilityProvider } from "@/components/visibility";
import { QuickActions } from "@/components/quickActions";
import { BannersStack } from "@/components/banners";
import React from "react";
import AddFundsModal from "@/components/home/AddFundsModal";
import { useGlobalBalances } from "@/hooks/useGlobalBalances";
import { useNgnConversion } from "@/hooks/useNgnConversion";
import RecentTransactions from "@/components/home/RecentTransactions";

function formatUsd(n: number) {
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;
}

function formatNgn(n: number) {
  return `₦${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;
}

export default function HomePage() {
  const [addOpen, setAddOpen] = React.useState(false);
	const userId = useAuthStore((s) => s.userId);
	const country = useAuthStore((s) => s.country);
	const displayName = userId ? generateHandleFromUserId(userId, "shortHex") : "there";
  const { data: balances } = useGlobalBalances();
  const { convertUsdToNgn } = useNgnConversion();
  
  const availableToBorrowUsd = balances?.availableToBorrowUsd ?? 0;
  const availableToBorrowNgn = convertUsdToNgn(availableToBorrowUsd);
  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <VisibilityProvider>
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
					<HomeTopNav name={displayName} />
        </div>

        <section className="mt-4">
          <GlobalAccountsScroller />
        </section>

        <section className="mt-6">
          <BalanceRow 
            label="Available to Borrow" 
            amount={formatNgn(availableToBorrowNgn)} 
            secondary={formatUsd(availableToBorrowUsd)} 
          />
        </section>
        
        <section className="mt-6">
          <QuickActions
            items={React.useMemo(() => ([
              { key: "add", iconSrc: "/icons/plus.svg", label: "Add", onClick: () => setAddOpen(true) },
              { key: "borrow", iconSrc: "/icons/arrow-down-right.svg", label: "Borrow", href: "/borrow" },
              { key: "repay", iconSrc: "/icons/arrow-down-tray.svg", label: "Repay", href: "/repayments" },
              { key: "earn", iconSrc: "/icons/arrow-trending-up.svg", label: "Earn", href: "/earn" },
            ]), [])}
          />
        </section>

        <section className="mt-6">
          <BannersStack />
        </section>

        <section className="mt-6">
          <RecentTransactions />
        </section>
        <AddFundsModal open={addOpen} onClose={() => setAddOpen(false)} />
        </VisibilityProvider>
        
      
      </main>

    </div>
  );
}


