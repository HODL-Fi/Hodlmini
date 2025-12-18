"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { HomeIcon, BorrowIcon, EarnIcon, WalletIcon, SettingsIcon } from "@customIcons";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; size?: number | string; color?: string; strokeWidth?: number; variant?: "outline" | "filled" }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/borrow", label: "Borrow", Icon: BorrowIcon },
  { href: "/coming-soon", label: "Earn", Icon: EarnIcon },
  // { href: "/wallet", label: "Wallet", Icon: WalletIcon }, // hidden per request
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* NEW BottomNav (commented out) */}
      {/**
      <nav className="fixed bottom-[max(env(safe-area-inset-bottom),8px)] left-1/2 z-20 w-[calc(100%-16px)] max-w-[560px] -translate-x-1/2 rounded-[20px] border border-gray-200 bg-white/80 px-1.5 py-1.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <ul className="flex h-12 items-center justify-around gap-1 text-[11px]">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            const supportsVariant = Icon === HomeIcon || Icon === WalletIcon;
            const activeColor = "#2200FF";
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition-colors ${
                    isActive ? "bg-[#E6DEFF]" : "hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    size={18}
                    color={isActive ? activeColor : "#676E76"}
                    strokeWidth={1.5}
                    className={isActive ? "" : "opacity-90"}
                    {...(supportsVariant ? { variant: isActive ? "filled" : "outline" } : {})}
                  />
                  <span className={isActive ? "font-semibold text-gray-900" : "text-gray-700"}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      */}

      {/* OLD BottomNav (active, with updated border color and shadow) */}
      <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-[560px] -translate-x-1/2 border-t border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-lg">
        <ul className="flex h-16 items-center justify-around px-2 text-[11px]">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            const supportsVariant = Icon === HomeIcon || Icon === WalletIcon;
            const activeColor = "#2200FF";
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={
                      isActive
                        ? "rounded-full bg-[#D3CCFF] px-3 py-2"
                        : "px-3 py-2"
                    }
                  >
                    <Icon
                      size={18}
                      color={isActive ? activeColor : "#676E76"}
                      strokeWidth={1.5}
                      className={isActive ? "" : "opacity-90"}
                      {...(supportsVariant ? { variant: isActive ? "filled" : "outline" } : {})}
                    />
                  </span>
                  <span
                    className={
                      isActive
                        ? "font-semibold text-gray-900"
                        : "text-gray-600"
                    }
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}


