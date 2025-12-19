"use client";
import React from "react";
import Modal from "@/components/ui/Modal";
import Image from "next/image";

type Row = { label: string; value: React.ReactNode };

function formatValue(value: React.ReactNode): React.ReactNode {
  if (typeof value !== "string") return value;
  const v = value.trim();
  // Shorten long hex addresses: 0x0000...0000
  if (/^0x[0-9a-fA-F]{10,}$/.test(v)) {
    return (
      <span className="font-mono">
        {v.slice(0, 6)}...{v.slice(-4)}
      </span>
    );
  }
  return value;
}

export default function TxConfirmModal({
  open,
  onClose,
  title,
  iconSrc,
  rows,
  confirmLabel = "Confirm",
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  iconSrc?: string;
  rows: Row[];
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const canConfirm = true;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="text-[18px] font-semibold">{title}</div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {iconSrc && (
          <div className="flex items-center justify-center">
            <Image src={iconSrc} alt="icon" width={56} height={56} />
          </div>
        )}
        <div className="rounded-2xl border border-gray-200 bg-white p-3">
          <div className="grid grid-cols-2 gap-y-2 text-[14px]">
            {rows.map((r, i) => (
              <React.Fragment key={i}>
                <div className="text-gray-600">{r.label}</div>
                <div className="text-right font-medium break-all">
                  {formatValue(r.value)}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            className={`w-1/2 rounded-[14px] px-4 py-3 text-[14px] font-medium text-white ${
              canConfirm ? "bg-[#2200FF] cursor-pointer" : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

