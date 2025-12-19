"use client";
import React from "react";
import { usePathname } from "next/navigation";
import AccountsScroller from "./AccountsScroller";
import { WalletIcon, VaultIcon } from "@customIcons";
import { useGlobalBalances } from "@/hooks/useGlobalBalances";
import { useNgnConversion } from "@/hooks/useNgnConversion";

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

  const activeId = React.useMemo(() => {
    if ((pathname ?? "").startsWith("/wallet")) return "evm";
    if ((pathname ?? "").startsWith("/vault")) return "vault";
    return "limit"; // default highlight on home
  }, [pathname]);

  const items = React.useMemo(() => {
    const rawLoanUsd = balances.loanUsd === 0 ? 0 : balances.loanUsd * -1;
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
        amount: formatUsd(balances.walletUsd),
        icon: <WalletIcon size={18} color="#2200FF" variant="filled" />,
        emphasis: activeId === "evm" ? ("primary" as "primary") : ("default" as "default"),
        verified: activeId === "evm",
        href: "/wallet",
      },
      {
        id: "vault",
        label: "My Vault",
        amount: formatUsd(balances.collateralUsd),
        icon: <VaultIcon size={18} color="#16A34A" variant="filled" />,
        iconBgClassName: "bg-[#A8DCAB]",
        emphasis: activeId === "vault" ? ("primary" as "primary") : ("default" as "default"),
        verified: activeId === "vault",
        href: "/vault",
      },
    ];
  }, [activeId, balances, convertUsdToNgn]);

  return <AccountsScroller items={items} />;
}


