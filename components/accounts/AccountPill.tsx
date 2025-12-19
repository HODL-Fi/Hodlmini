"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useVisibility } from "@/components/visibility";

type AccountPillProps = {
  label: string;
  amount: string;
  icon?: React.ReactNode;
  emphasis?: "default" | "primary";
  verified?: boolean;
  negative?: boolean;
  onClick?: () => void;
  className?: string;
  href?: string;
  iconBgClassName?: string;
};

export default function AccountPill({
  label,
  amount,
  icon,
  emphasis = "default",
  verified = false,
  negative,
  onClick,
  className,
  href,
  iconBgClassName,
}: AccountPillProps) {
  const { hidden } = useVisibility();
  const containerClasses =
    emphasis === "primary"
      ? "bg-white/90 border border-gray-200"
      : "bg-gray-100 border border-gray-200";

  const iconWrapClasses = iconBgClassName
    ? iconBgClassName
    : emphasis === "primary"
      ? "bg-[#E6DEFF]"
      : "bg-gray-300";

  const content = (
    <div className={`relative flex items-center gap-3 rounded-full px-3 py-2 w-full ${containerClasses} ${className ?? ""}`}>
      <span className={`relative inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${iconWrapClasses}`}>
        <span className="flex items-center justify-center pointer-events-none">
          {icon}
        </span>
      </span>
      <span className="text-left">
        <span className="block text-[12px] leading-3 text-gray-600 whitespace-nowrap">{label}</span>
        <span className={`block text-[16px] font-medium leading-5 tracking-tight ${
          (negative ?? /-/.test(amount)) ? "text-[#F34141]" : "text-gray-900"
        } ${hidden ? "blur-[5px]" : ""}`}>{amount}</span>
      </span>
      {verified && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
          <Image src="/checkmark.svg" alt="verified" width={14} height={14} />
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="cursor-pointer hover:scale-102 transition-all duration-100"
        title={label}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer hover:scale-102 transition-all duration-100"
    >
      {content}
    </button>
  );
}


