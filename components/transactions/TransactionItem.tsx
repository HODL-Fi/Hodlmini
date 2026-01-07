import Image from "next/image";
import React from "react";
import Link from "next/link";
import {
  HandCoins,
  ArrowUpFromLine,
  TrendingUp,
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Send,
  ArrowDownLeft,
} from "lucide-react";

export type TransactionStatus = "success" | "failed" | "pending";
export type TransactionType = "borrow" | "repay" | "earn" | "add" | "convert" | "send" | "receive" | "swap" | "deposit" | "withdraw";

export type TransactionItemProps = {
  id: string;
  title?: string; // optional override
  type: TransactionType;
  amount: string; // pre-formatted like "+₦50,000.00" or "-₦100,000.00"
  timestamp: string; // display line
  status?: TransactionStatus;
  iconSrc?: string; // override icon path (from /public) - for transaction type icon
  tokenLogo?: string; // token logo URL - displayed in amount area
  href?: string; // optional link
};

const typeToDefaults: Record<TransactionType, { title: string; Icon: React.ComponentType<{ size?: number | string; className?: string }> }> = {
  borrow: { title: "Money borrowed", Icon: HandCoins },
  repay: { title: "Loan repaid", Icon: ArrowUpFromLine },
  earn: { title: "Earnings", Icon: TrendingUp },
  add: { title: "Added funds", Icon: PlusCircle },
  convert: { title: "Converted", Icon: RefreshCw },
  send: { title: "Sent", Icon: Send },
  receive: { title: "Received", Icon: ArrowDownLeft },
  swap: { title: "Swap", Icon: RefreshCw },
  deposit: { title: "Deposit", Icon: ArrowDownCircle },
  withdraw: { title: "Withdraw", Icon: ArrowUpCircle },
};

export default function TransactionItem({ id, title, type, amount, timestamp, status = "success", iconSrc, tokenLogo, href }: TransactionItemProps) {
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
          {iconSrc ? (
            <Image src={iconSrc} alt={type} width={22} height={22} />
          ) : (
            <defaults.Icon size={22} className="text-gray-700" />
          )}
        </span>
        <div className="text-left">
          <div className="text-[16px] font-medium leading-5 text-gray-900">{title ?? defaults.title}</div>
          <div className="mt-1 text-[12px] leading-4 text-gray-500">{timestamp}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`flex items-center justify-end gap-1.5 text-[16px] leading-5 ${isNegative ? "text-[#F34141]" : "text-gray-900"}`}>
          {(() => {
            // Parse amount string: "1.00 USDC ($1.00)" or "1.00 USDC"
            // Extract: amount number, token symbol, and secondary value
            const amountMatch = amount.match(/^([+-]?[\d,]+\.?\d*)\s+(\w+)\s*(\([^)]+\))?/);
            if (amountMatch && tokenLogo) {
              // If we have a logo, show: "1.00" [Logo] "($1.00)"
              const amountNum = amountMatch[1];
              const secondary = amountMatch[3] || "";
              return (
                <>
                  <span>{amountNum}</span>
                  <Image 
                    src={tokenLogo} 
                    alt="Token" 
                    width={20} 
                    height={20}
                    className="rounded-full flex-shrink-0"
                    onError={(e) => {
                      // Hide logo if it fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  {secondary && <span className="text-gray-500">{secondary}</span>}
                </>
              );
            }
            // Fallback: show amount as-is if parsing fails or no logo
            return (
              <>
                {tokenLogo && (
                  <Image 
                    src={tokenLogo} 
                    alt="Token" 
                    width={20} 
                    height={20}
                    className="rounded-full flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                )}
                <span>{amount}</span>
              </>
            );
          })()}
        </div>
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


