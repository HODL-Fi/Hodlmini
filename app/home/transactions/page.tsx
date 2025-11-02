"use client";
import { TransactionsList } from "@/components/transactions";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { ArrowLeftIcon } from "@customIcons";
import TransactionsFilterTrigger from "@/components/transactions/TransactionsFilterTrigger";
import React from "react";

export default function HomeTransactionsPage() {
  const allItems = [
    { id: "1", type: "borrow", amount: "-₦100,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
    { id: "2", type: "repay", amount: "+₦50,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
    { id: "3", type: "borrow", amount: "-₦100,000.00", timestamp: "18 Sep at 12:19PM", status: "failed" },
    { id: "4", type: "repay", amount: "+₦50,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
    { id: "5", type: "borrow", amount: "-₦100,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
    { id: "6", type: "repay", amount: "+₦50,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
    { id: "7", type: "borrow", amount: "-₦100,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
    { id: "8", type: "repay", amount: "+₦50,000.00", timestamp: "18 Sep at 12:19PM", status: "success" },
    { id: "9", type: "borrow", amount: "-₦25,000.00", timestamp: "17 Sep at 3:02PM", status: "success" },
    { id: "10", type: "repay", amount: "+₦10,000.00", timestamp: "17 Sep at 12:40PM", status: "success" },
    { id: "11", type: "earn", amount: "+₦1,250.00", timestamp: "16 Sep at 9:15AM", status: "success" },
    { id: "13", type: "add", amount: "+₦5,000.00", timestamp: "16 Sep at 8:55AM", status: "success" },
    { id: "14", type: "borrow", amount: "-₦75,000.00", timestamp: "15 Sep at 7:22PM", status: "failed" },
    { id: "15", type: "repay", amount: "+₦20,000.00", timestamp: "15 Sep at 6:03PM", status: "success" },
    { id: "16", type: "borrow", amount: "-₦18,500.00", timestamp: "15 Sep at 2:14PM", status: "pending" },
    { id: "17", type: "repay", amount: "+₦8,000.00", timestamp: "14 Sep at 11:32AM", status: "success" },
    { id: "18", type: "earn", amount: "+₦980.00", timestamp: "14 Sep at 9:01AM", status: "success" },
    { id: "20", type: "borrow", amount: "-₦12,000.00", timestamp: "13 Sep at 4:47PM", status: "success" },
    { id: "21", type: "repay", amount: "+₦12,000.00", timestamp: "13 Sep at 4:50PM", status: "success" },
    { id: "22", type: "borrow", amount: "-₦40,000.00", timestamp: "13 Sep at 10:12AM", status: "success" },
    { id: "23", type: "repay", amount: "+₦15,500.00", timestamp: "12 Sep at 6:45PM", status: "success" },
    { id: "24", type: "borrow", amount: "-₦60,000.00", timestamp: "12 Sep at 1:10PM", status: "failed" },
    { id: "25", type: "repay", amount: "+₦30,000.00", timestamp: "12 Sep at 1:25PM", status: "success" },
    { id: "26", type: "earn", amount: "+₦1,120.00", timestamp: "11 Sep at 9:00AM", status: "success" },
    { id: "27", type: "borrow", amount: "-₦9,500.00", timestamp: "11 Sep at 8:40AM", status: "success" },
    { id: "28", type: "repay", amount: "+₦9,500.00", timestamp: "11 Sep at 8:55AM", status: "success" },
  ] as any[];

  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(["borrow", "repay", "add", "earn"]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>(["success", "failed", "pending"]);
  const [selectedRange, setSelectedRange] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return allItems.filter((it) =>
      (selectedTypes.length === 0 || selectedTypes.includes(it.type)) &&
      (selectedStatuses.length === 0 || selectedStatuses.includes(it.status))
    );
  }, [allItems, selectedTypes, selectedStatuses]);
  return (
    <div className="min-h-dvh px-2 py-4 text-left">
      <AppHeader
        title="Transactions"
        left={
          <Link href="/home" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeftIcon size={18} color="#374151" />
          </Link>
        }
        right={
          <TransactionsFilterTrigger
            onApply={({ types, statuses, range }) => {
              setSelectedTypes(types);
              setSelectedStatuses(statuses);
              setSelectedRange(range);
            }}
            defaultTypes={selectedTypes}
            defaultStatuses={selectedStatuses}
            defaultRange={selectedRange}
          />
        }
      />
      <div className="mt-3">
        <TransactionsList
          title=""
          items={(filtered as any).map((it: any) => ({
            ...it,
            href: `/home/transactions/${it.id}?type=${it.type === "borrow" ? "borrow" : "repay"}&status=${it.status}`,
          }))}
        />
      </div>
    </div>
  );
}


