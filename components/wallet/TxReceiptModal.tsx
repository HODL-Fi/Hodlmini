"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Image from "next/image";

type TxReceipt = {
  from?: string;
  to?: string;
  amount?: number | string;
  displayAmount?: string;
  tokenSymbol?: string;
  transactionHash?: string;
  createdAt?: string;
};

type TxReceiptModalProps = {
  open: boolean;
  onClose: () => void;
  receipt?: TxReceipt | null;
};

function formatAddress(value?: string | null) {
  if (!value) return "—";
  const v = value.trim();
  if (/^0x[0-9a-fA-F]{10,}$/.test(v)) {
    return `${v.slice(0, 6)}...${v.slice(-4)}`;
  }
  return v || "—";
}

export default function TxReceiptModal({ open, onClose, receipt }: TxReceiptModalProps) {
  const { from, to, amount, displayAmount, tokenSymbol, transactionHash, createdAt } = receipt || {};
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const createdAtLabel = React.useMemo(() => {
    if (!createdAt) return "—";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return createdAt;
    return d.toLocaleString();
  }, [createdAt]);

  async function handleCopy(key: "from" | "to" | "hash", value?: string | null) {
    if (!value) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4 text-left">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[18px] font-semibold">Transfer receipt</div>
            <div className="mt-1 text-[12px] text-gray-600">Details of your recent send.</div>
          </div>
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

        <div className="rounded-2xl border border-gray-200 bg-white p-3">
          <div className="grid grid-cols-2 gap-y-2 text-[14px]">
            <div className="text-gray-600">From</div>
            <div className="text-right font-medium">
              <div className="flex items-center justify-end gap-2">
                <span className="break-all font-mono">{formatAddress(from)}</span>
                {from && (
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCopy("from", from)}
                    aria-label="Copy from address"
                  >
                    <Image src="/icons/copy.svg" alt="Copy" width={14} height={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="text-gray-600">To</div>
            <div className="text-right font-medium">
              <div className="flex items-center justify-end gap-2">
                <span className="break-all font-mono">{formatAddress(to)}</span>
                {to && (
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCopy("to", to)}
                    aria-label="Copy to address"
                  >
                    <Image src="/icons/copy.svg" alt="Copy" width={14} height={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="text-gray-600">Amount</div>
            <div className="text-right font-medium">
              {displayAmount != null && displayAmount !== ""
                ? `${displayAmount}${tokenSymbol ? ` ${tokenSymbol}` : ""}`
                : amount != null && amount !== ""
                  ? String(amount)
                  : "—"}
            </div>

            <div className="text-gray-600">Transaction hash</div>
            <div className="text-right font-medium">
              <div className="flex items-center justify-end gap-2">
                <span className="break-all font-mono">{formatAddress(transactionHash)}</span>
                {transactionHash && (
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCopy("hash", transactionHash)}
                    aria-label="Copy transaction hash"
                  >
                    <Image src="/icons/copy.svg" alt="Copy" width={14} height={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="text-gray-600">Created at</div>
            <div className="text-right font-medium">
              {createdAtLabel}
            </div>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-end">
          <button
            type="button"
            className="rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}


