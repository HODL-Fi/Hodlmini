"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";
import { TransactionsList } from "@/components/transactions";

export default function WalletHistoryPage() {
  const all = React.useMemo(() => ([
    { id: "s1", type: "send" as const, amount: "-$120.00", timestamp: "Today 10:12 AM", status: "success" as const },
    { id: "r1", type: "receive" as const, amount: "+$300.00", timestamp: "Today 09:00 AM", status: "success" as const },
    { id: "w1", type: "swap" as const, amount: "-$50.00", timestamp: "Yesterday 5:14 PM", status: "success" as const },
    { id: "s2", type: "send" as const, amount: "-$80.00", timestamp: "Yesterday 2:45 PM", status: "failed" as const },
  ]), []);
  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="History" subtitle="Your recent wallet activity" showBack />
        </div>
        <section className="mt-4">
          <TransactionsList items={all as any} linkBase="/home/transactions" />
        </section>
      </main>
    </div>
  );
}


