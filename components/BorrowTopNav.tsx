"use client";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { BellIcon, ArrowLeftIcon } from "@customIcons";

type BorrowTopNavProps = {
  title?: string;
  subtitle?: string;
  onBellClick?: () => void;
  showBack?: boolean;
};

export default function BorrowTopNav({ title = "Borrow", subtitle = "Have finance without liquidating", onBellClick, showBack }: BorrowTopNavProps) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-left">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              type="button"
              aria-label="Back"
              onClick={() => router.back()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 cursor-pointer"
            >
              <ArrowLeftIcon size={16} color="#374151" />
            </button>
          )}
          <div className="text-[24px] font-semibold leading-6 tracking-tight">{title}</div>
        </div>
        <div className="mt-1 text-[12px] leading-4 text-gray-600">{subtitle}</div>
      </div>
      {onBellClick ? (
        <button
          type="button"
          aria-label="Notifications"
          onClick={onBellClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 cursor-pointer"
        >
          <BellIcon size={16} color="#454C52" strokeWidth={1.5} />
        </button>
      ) : (
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 cursor-pointer"
        >
          <BellIcon size={16} color="#454C52" strokeWidth={1.5} />
        </Link>
      )}
    </div>
  );
}


