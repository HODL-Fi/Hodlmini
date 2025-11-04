"use client";
import React from "react";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AddFundsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="text-[18px] font-semibold">Add funds</div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => { onClose(); router.push("/wallet/receive"); }}
            className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50"
          >
            <Image src="/icons/arrow-down-left.svg" alt="Crypto" width={22} height={22} />
            <div className="flex-1">
              <div className="text-[14px] font-medium">Deposit crypto</div>
              <div className="text-[12px] text-gray-600">Send tokens to your wallet address</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          <div className="flex w-full items-center gap-3 bg-white px-3 py-3 opacity-70">
            <Image src="/icons/credit-card.svg" alt="Card" width={22} height={22} />
            <div className="flex-1">
              <div className="text-[14px] font-medium">Card (coming soon)</div>
              <div className="text-[12px] text-gray-600">Top up with debit or credit card</div>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-600">Soon</span>
          </div>

          <div className="flex w-full items-start gap-3 bg-white px-3 py-3 opacity-70">
            <Image src="/icons/bank.svg" alt="Bank" width={22} height={22} />
            <div className="flex-1">
              <div className="text-[14px] font-medium">Dedicated account (coming soon)</div>
              <div className="text-[12px] text-gray-600">Credit your dedicated account directly</div>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-600">Soon</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}


