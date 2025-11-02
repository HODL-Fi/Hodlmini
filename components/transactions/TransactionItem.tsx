import Image from "next/image";
import React from "react";
import Link from "next/link";

export type TransactionStatus = "success" | "failed" | "pending";
export type TransactionType = "borrow" | "repay" | "earn" | "add" | "convert" | "send" | "receive" | "swap";

export type TransactionItemProps = {
  id: string;
  title?: string; // optional override
  type: TransactionType;
  amount: string; // pre-formatted like "+₦50,000.00" or "-₦100,000.00"
  timestamp: string; // display line
  status?: TransactionStatus;
  iconSrc?: string; // override icon path (from /public)
  href?: string; // optional link
};

const typeToDefaults: Record<TransactionType, { title: string; icon: string }> = {
  borrow: { title: "Money borrowed", icon: "/icons/arrow-down-right.svg" },
  repay: { title: "Loan repaid", icon: "/icons/arrow-down-tray.svg" },
  earn: { title: "Earnings", icon: "/icons/arrow-trending-up.svg" },
  add: { title: "Added funds", icon: "/icons/plus.svg" },
  convert: { title: "Converted", icon: "/icons/convert.svg" },
  send: { title: "Sent", icon: "/icons/arrow-up-right.svg" },
  receive: { title: "Received", icon: "/icons/arrow-down-left.svg" },
  swap: { title: "Swap", icon: "/icons/swap.svg" },
};

export default function TransactionItem({ id, title, type, amount, timestamp, status = "success", iconSrc, href }: TransactionItemProps) {
  const defaults = typeToDefaults[type];
  const isNegative = /-/.test(amount);
  const badgeClasses =
    status === "success"
      ? "bg-emerald-100 text-emerald-700"
      : status === "failed"
      ? "bg-red-200 text-red-700"
      : "bg-gray-200 text-gray-700";

  const Content = (
    <div className="flex items-start justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
          <Image src={iconSrc ?? defaults.icon} alt={type} width={22} height={22} />
        </span>
        <div className="text-left">
          <div className="text-[16px] font-medium leading-5 text-gray-900">{title ?? defaults.title}</div>
          <div className="mt-1 text-[12px] leading-4 text-gray-500">{timestamp}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-[16px] leading-5 ${isNegative ? "text-[#F34141]" : "text-gray-900"}`}>{amount}</div>
        <div className={`mt-2 inline-flex rounded-full px-2 py-1 text-[12px] ${badgeClasses}`}>{status === "failed" ? "Failed" : status === "pending" ? "Pending" : "Success"}</div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {Content}
    </Link>
  ) : (
    Content
  );
}


