"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";

type QuickActionProps = {
  iconSrc: string; // path from /public, e.g. "/icons/plus.svg"
  label: string;
  onClick?: () => void;
  className?: string;
  href?: string;
};

export default function QuickAction({ iconSrc, label, onClick, className, href }: QuickActionProps) {
  const content = (
    <div className={`flex w-[86px] flex-col items-center gap-2 text-gray-600 ${className ?? ""}`}>
      <span className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gray-100">
        <Image src={iconSrc} alt={label} width={24} height={24} />
      </span>
      <span className="text-[14px] leading-4">{label}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="cursor-pointer" title={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="cursor-pointer">
      {content}
    </button>
  );
}


