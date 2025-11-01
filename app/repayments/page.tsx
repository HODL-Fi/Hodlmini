"use client";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import React from "react";
import { TransactionsList } from "@/components/transactions";
import { ArrowLeftIcon } from "@customIcons";

export default function RepaymentsPage() {
  const pendingLoans = [
    { id: "r1", type: "borrow", amount: "-₦100,000.00", timestamp: "18 Sep at 12:19PM", status: "pending" },
    { id: "r2", type: "borrow", amount: "-₦75,000.00", timestamp: "17 Sep at 3:02PM", status: "pending" },
    { id: "r3", type: "borrow", amount: "-₦18,500.00", timestamp: "15 Sep at 2:14PM", status: "pending" },
  ] as any[];

  return (
    <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
      <AppHeader
        title="Repayments"
        fixed
        left={
          <Link href="/home" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeftIcon size={18} color="#374151" />
          </Link>
        }
      />

      <div className="mt-3">
        <TransactionsList
          title="Pending loans"
          items={pendingLoans.map((it) => ({ ...it, href: `/repayments/${it.id}?status=pending` })) as any}
        />
      </div>
    </div>
  );
}
