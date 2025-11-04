"use client";
import React from "react";
import { usePathname } from "next/navigation";
import AccountsScroller from "./AccountsScroller";
import { WalletIcon, VaultIcon } from "@customIcons";

export default function GlobalAccountsScroller() {
  const pathname = usePathname();
  const activeId = React.useMemo(() => {
    if ((pathname ?? "").startsWith("/wallet")) return "evm";
    if ((pathname ?? "").startsWith("/vault")) return "vault";
    return "limit"; // default highlight on home
  }, [pathname]);

  const items = React.useMemo(() => (
    [
      {
        id: "limit",
        label: "Loan balance",
        amount: "-₦500,000.76",
        icon: <WalletIcon size={18} color="#111" strokeWidth={1.8} />,
        verified: activeId === "limit",
        href: "/home",
        emphasis: activeId === "limit" ? "primary" as const : "default" as const,
      },
      {
        id: "evm",
        label: "My Wallet",
        amount: "$22,199.09",
        icon: <WalletIcon size={18} color="#2200FF" variant="filled" />,
        emphasis: activeId === "evm" ? "primary" as const : "default" as const,
        verified: activeId === "evm",
        href: "/wallet",
      },
      {
        id: "vault",
        label: "My Vault",
        amount: "$22,199.00",
        icon: <VaultIcon size={18} color="#16A34A" variant="filled" />,
        iconBgClassName: "bg-[#A8DCAB]",
        emphasis: activeId === "vault" ? "primary" as const : "default" as const,
        verified: activeId === "vault",
        href: "/vault?sim=1",
      },
    ]
  ), [activeId]);

  return <AccountsScroller items={items} />;
}


