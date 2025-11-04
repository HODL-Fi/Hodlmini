"use client";
import React from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inTx = pathname?.startsWith("/home/transactions");
  const inWalletSub = pathname?.startsWith("/wallet/") && pathname !== "/wallet";
  const hideBottomNav = Boolean(inTx || inWalletSub);
  const pb = hideBottomNav
    ? "pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+0px)]"
    : "pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+64px)]";
  return (
    <div className={`mx-auto w-full max-w-[560px] min-h-dvh pt-[max(env(safe-area-inset-top),0px)] ${pb}`}>
      {children}
      {hideBottomNav ? null : <BottomNav />}
    </div>
  );
}


