"use client";
import Link from "next/link";
import React from "react";
import AppHeader from "@/components/AppHeader";
import { ArrowLeftIcon } from "@customIcons";

const combos = [
  { id: "t-borrow-success", label: "Borrow • Success", href: "/home/transactions/101?type=borrow&status=success" },
  { id: "t-borrow-pending", label: "Borrow • Pending", href: "/home/transactions/102?type=borrow&status=pending" },
  { id: "t-borrow-failed", label: "Borrow • Failed", href: "/home/transactions/103?type=borrow&status=failed" },
  { id: "t-repay-success", label: "Repay • Success", href: "/home/transactions/201?type=repay&status=success" },
  { id: "t-repay-pending", label: "Repay • Pending", href: "/home/transactions/202?type=repay&status=pending" },
  { id: "t-repay-failed", label: "Repay • Failed", href: "/home/transactions/203?type=repay&status=failed" },
];

const repayCombos = [
  { id: "r-pending", label: "Repayment • Pending", href: "/repayments/r1?status=pending" },
  { id: "r-paid", label: "Repayment • Paid", href: "/repayments/r1?status=paid" },
];

export default function SimulationPage() {
  return (
    <div className="min-h-dvh px-2 pt-14 pb-6">
      <AppHeader
        title="Simulation"
        fixed
        left={<Link href="/home" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"><ArrowLeftIcon size={18} color="#374151" /></Link>}
      />

      <div className="mx-auto mt-4 w-full max-w-[560px] space-y-8">
        <section>
          <h2 className="mb-3 text-[18px] font-semibold">Transactions</h2>
          <div className="grid grid-cols-2 gap-2">
            {combos.map((c) => (
              <Link key={c.id} href={c.href} className="rounded-xl border border-gray-200 px-3 py-3 text-[14px]">
                {c.label}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[18px] font-semibold">Repayments</h2>
          <div className="grid grid-cols-2 gap-2">
            {repayCombos.map((c) => (
              <Link key={c.id} href={c.href} className="rounded-xl border border-gray-200 px-3 py-3 text-[14px]">
                {c.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


