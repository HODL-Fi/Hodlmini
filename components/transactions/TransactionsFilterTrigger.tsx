"use client";
import Image from "next/image";
import React from "react";
import TransactionsFilterSheet from "./TransactionsFilterSheet";

type Props = {
  onApply: (data: { types: string[]; statuses: string[]; range: string | null }) => void;
  defaultTypes?: string[];
  defaultStatuses?: string[];
  defaultRange?: string | null;
};

export default function TransactionsFilterTrigger({ onApply, defaultTypes, defaultStatuses, defaultRange }: Props) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 cursor-pointer"
      >
        <Image src="/icons/filter.svg" alt="Filter" width={13} height={14} />
      </button>
      <TransactionsFilterSheet open={open} onClose={() => setOpen(false)} onApply={onApply} defaultTypes={defaultTypes} defaultStatuses={defaultStatuses} defaultRange={defaultRange} />
    </>
  );
}


