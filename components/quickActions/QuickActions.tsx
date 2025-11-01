"use client";
import React from "react";
import QuickAction from "./QuickAction";

type Item = {
  key: string;
  iconSrc: string;
  label: string;
  onClick?: () => void;
  href?: string;
};

type QuickActionsProps = {
  items: Item[];
  className?: string;
};

export default function QuickActions({ items, className }: QuickActionsProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className ?? ""}`}>
      {items.map((it) => (
        <QuickAction key={it.key} iconSrc={it.iconSrc} label={it.label} onClick={it.onClick} href={it.href} />
      ))}
    </div>
  );
}


