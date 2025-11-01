import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BellIcon } from "@customIcons";

type HomeTopNavProps = {
  name: string;
  subtitleLine?: string;
  onBellClick?: () => void;
};

export default function HomeTopNav({
  name,
  subtitleLine = "Experience financial flexibility",
  onBellClick,
}: HomeTopNavProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Image
          src="/userdefaults/capricornn.svg"
          alt="User avatar"
          width={44}
          height={44}
          priority
        />
        <div className="text-left">
          <div className="text-[14px] leading-6 tracking-tight">
            Hi, <span className="font-medium">{name}</span>
          </div>
          <div className="text-[10px] leading-4 text-gray-600">
            {subtitleLine}
          </div>
        </div>
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


