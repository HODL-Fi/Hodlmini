"use client";

import React from "react";
import Image from "next/image";

type AuthTagCollageProps = {
  variant?: "finance" | "crypto";
  height?: number; // px
};

export default function AuthTagCollage({ variant = "crypto", height = 180 }: AuthTagCollageProps) {
  return (
    <div
      className="relative w-full max-w-[360px] mx-auto overflow-hidden select-none"
      style={{ height, transform: "translateZ(0)" }}
      aria-hidden="true"
    >
      <div className="h-full w-full flex items-center justify-center">
        <Image
          src="/icons/auth.svg"
          alt="Auth Illustration"
          width={146}
          height={234}
          className="h-full w-auto"
          priority={false}
        />
      </div>
    </div>
  );
}


