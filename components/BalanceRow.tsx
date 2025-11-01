"use client";
import React from "react";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "@customIcons";
import { useVisibility } from "@/components/visibility";

type BalanceRowProps = {
  label: string;
  amount: string; // pre-formatted display string
  negative?: boolean; // overrides auto-detect
  className?: string;
  href?: string;
};

export default function BalanceRow({ label, amount, negative, className, href }: BalanceRowProps) {
  const { hidden, toggle } = useVisibility();
  const isNegative = negative ?? /-/.test(amount);
  const content = (
    <div className={`${className ?? ""}`}>
      <div className="text-[12px] font-medium text-gray-600">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <div className={`text-[28px] font-semibold tracking-tight ${isNegative ? "text-[#F34141]" : "text-gray-900"}`}>
          {hidden ? "********" : amount}
        </div>
        <button
          type="button"
          aria-label={hidden ? "Show balance" : "Hide balance"}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:text-gray-700 cursor-pointer hover:scale-110 transition-all duration-200"
        >
          {hidden ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
        </button>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block" title={`${label} — ${amount}`}>
        {content}
      </Link>
    );
  }

  return content;
}


