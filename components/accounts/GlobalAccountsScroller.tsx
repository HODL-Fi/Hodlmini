"use client";
import React from "react";
import { usePathname } from "next/navigation";
import AccountsScroller from "./AccountsScroller";
import { WalletIcon, VaultIcon } from "@customIcons";
import { useGlobalBalances } from "@/hooks/useGlobalBalances";
import { useNgnConversion } from "@/hooks/useNgnConversion";
import { useAccountBalancesStore } from "@/stores/useAccountBalancesStore";

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

export default function GlobalAccountsScroller() {
  const pathname = usePathname();
  const { data: balances } = useGlobalBalances();
  const { convertUsdToNgn } = useNgnConversion();
  const { balances: persistedBalances } = useAccountBalancesStore();
  
  // Use persisted balances if available and fresh (less than 5 minutes old), otherwise use live data
  const balancesToUse = React.useMemo(() => {
    if (persistedBalances && persistedBalances.lastUpdated) {
      const age = Date.now() - persistedBalances.lastUpdated;
      // Use persisted data if less than 5 minutes old, otherwise use live data
      if (age < 5 * 60 * 1000) {
        return {
          walletUsd: persistedBalances.walletUsd,
          loanUsd: persistedBalances.loanUsd,
          collateralUsd: persistedBalances.collateralUsd,
          availableToBorrowUsd: persistedBalances.availableToBorrowUsd,
        };
      }
    }
    return balances;
  }, [balances, persistedBalances]);

  const activeId = React.useMemo(() => {
    if ((pathname ?? "").startsWith("/wallet")) return "evm";
    if ((pathname ?? "").startsWith("/vault")) return "vault";
    return "limit"; // default highlight on home
  }, [pathname]);

  const items = React.useMemo(() => {
    if (!balancesToUse) {
      // Return empty/loading state if no balances available
      return [
        {
          id: "limit",
          label: "Loan balance",
          amount: formatNgn(0),
          icon: <WalletIcon size={18} color="#111" strokeWidth={1.8} />,
          verified: activeId === "limit",
          href: "/home",
          emphasis: activeId === "limit" ? ("primary" as "primary") : ("default" as "default"),
        },
        {
          id: "evm",
          label: "My Wallet",
          amount: formatUsd(0),
          icon: <WalletIcon size={18} color="#2200FF" variant="filled" />,
          emphasis: activeId === "evm" ? ("primary" as "primary") : ("default" as "default"),
          verified: activeId === "evm",
          href: "/wallet",
        },
        {
          id: "vault",
          label: "My Vault",
          amount: formatUsd(0),
          icon: <VaultIcon size={18} color="#16A34A" variant="filled" />,
          iconBgClassName: "bg-[#A8DCAB]",
          emphasis: activeId === "vault" ? ("primary" as "primary") : ("default" as "default"),
          verified: activeId === "vault",
          href: "/vault",
        },
      ];
    }
    
    const rawLoanUsd = balancesToUse.loanUsd === 0 ? 0 : balancesToUse.loanUsd * -1;
    const loanNgn = convertUsdToNgn(rawLoanUsd);
    const signedLoanAmount =
      loanNgn === 0 ? formatNgn(0) : `-${formatNgn(Math.abs(loanNgn))}`;

    return [
      {
        id: "limit",
        label: "Loan balance",
        amount: signedLoanAmount,
        icon: <WalletIcon size={18} color="#111" strokeWidth={1.8} />,
        verified: activeId === "limit",
        href: "/home",
        emphasis: activeId === "limit" ? ("primary" as "primary") : ("default" as "default"),
      },
      {
        id: "evm",
        label: "My Wallet",
        amount: formatUsd(balancesToUse.walletUsd),
        icon: <WalletIcon size={18} color="#2200FF" variant="filled" />,
        emphasis: activeId === "evm" ? ("primary" as "primary") : ("default" as "default"),
        verified: activeId === "evm",
        href: "/wallet",
      },
      {
        id: "vault",
        label: "My Vault",
        amount: formatUsd(balancesToUse.collateralUsd),
        icon: <VaultIcon size={18} color="#16A34A" variant="filled" />,
        iconBgClassName: "bg-[#A8DCAB]",
        emphasis: activeId === "vault" ? ("primary" as "primary") : ("default" as "default"),
        verified: activeId === "vault",
        href: "/vault",
      },
    ];
  }, [activeId, balancesToUse, convertUsdToNgn]);

  return <AccountsScroller items={items} />;
}


