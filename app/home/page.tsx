import HomeTopNav from "@/components/HomeTopNav";
import { AccountsScroller } from "@/components/accounts";
import { WalletIcon } from "@customIcons";
import BalanceRow from "@/components/BalanceRow";
import { VisibilityProvider } from "@/components/visibility";
import { QuickActions } from "@/components/quickActions";
import { BannersStack } from "@/components/banners";
import { TransactionsList } from "@/components/transactions";
import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <main className="px-2 py-4 text-left">
        <VisibilityProvider>
        <HomeTopNav name="Jasper" />

        <section className="mt-4">
          <AccountsScroller
            items={React.useMemo(() => ([
              {
                id: "limit",
                label: "Spend Limit",
                amount: "₦1,000,00.76",
                icon: <WalletIcon size={18} color="#111" strokeWidth={1.8} />,
                verified: true,
              },
              {
                id: "evm",
                label: "EVM Wallet",
                amount: "$22,199.09",
                icon: <WalletIcon size={18} color="#2200FF" variant="filled" />,
                emphasis: "primary",
                href: "/wallet",
              },
              {
                id: "sol",
                label: "Solana Wallet",
                amount: "$22,199.09",
                icon: <WalletIcon size={18} color="#2200FF" variant="filled" />,
                emphasis: "primary",
                href: "/coming-soon",
              },
            ]), [])}
          />
        </section>

        <section className="mt-6">
          <BalanceRow label="Loan balance" amount="-₦1,000,00.76" />
        </section>
        
        <section className="mt-6">
          <QuickActions
            items={React.useMemo(() => ([
              { key: "add", iconSrc: "/icons/plus.svg", label: "Add" },
              { key: "borrow", iconSrc: "/icons/arrow-down-right.svg", label: "Borrow", href: "/borrow" },
              { key: "repay", iconSrc: "/icons/arrow-down-tray.svg", label: "Repay", href: "/repayments" },
              { key: "earn", iconSrc: "/icons/arrow-trending-up.svg", label: "Earn", href: "/coming-soon" },
            ]), [])}
          />
        </section>

        <section className="mt-6">
          <BannersStack />
        </section>

        <section className="mt-6">
          <TransactionsList
            viewAllHref="/home/transactions"
            items={React.useMemo(() => ([
              { id: "1", type: "borrow", amount: "-₦100,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
              { id: "2", type: "repay", amount: "+₦50,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
              { id: "3", type: "borrow", amount: "-₦100,000.00", timestamp: "18 Sep at 12:19PM", status: "failed" },
              { id: "4", type: "repay", amount: "+₦50,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
              { id: "5", type: "borrow", amount: "-₦100,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
            ]), [])}
          />
        </section>
        </VisibilityProvider>
        
      
      </main>

    </div>
  );
}


