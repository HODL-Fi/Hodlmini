"use client";

import React from "react";
import Image from "next/image";

type TokenAvatarProps = {
  symbol: string;
  iconSrc?: string;
  size?: number; // pixel size for width/height
  className?: string;
};

export default function TokenAvatar({ symbol, iconSrc, size = 28, className = "" }: TokenAvatarProps) {
  const initials = (symbol || "?").slice(0, 3).toUpperCase();

  return (
    <div
      className={`flex items-center justify-center rounded-full overflow-hidden ${className} ${
        iconSrc ? "bg-white" : "bg-gray-200"
      }`}
      style={{ width: size, height: size }}
    >
      {iconSrc ? (
        <Image
          src={iconSrc}
          alt={symbol}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[11px] font-semibold text-gray-600">{initials}</span>
      )}
    </div>
  );
}


