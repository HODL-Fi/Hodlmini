"use client";

import React from "react";
import Image from "next/image";

type DropdownPillProps = {
  label: string;
  iconSrc?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  iconSize?: number; // default 20
};

export default function DropdownPill({ label, iconSrc, onClick, disabled, ariaLabel, iconSize = 20 }: DropdownPillProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-[14px] font-medium text-gray-600 shadow-sm cursor-pointer ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-200"
      }`}
    >
      {iconSrc && <Image src={iconSrc} alt="" width={iconSize} height={iconSize} className="rounded-sm" />}
      <span className="tracking-wide">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}


