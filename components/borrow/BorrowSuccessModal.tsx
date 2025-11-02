"use client";

import React from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

type BorrowSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  onViewReceipt?: () => void;
  amountLabel?: string;
};

export default function BorrowSuccessModal({ open, onClose, onViewReceipt, amountLabel }: BorrowSuccessModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="text-[18px] font-semibold">Borrow successful</div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-3">
            <Image src="/icons/happy.svg" alt="Success" width={96} height={96} className="celebrate-pop" />
          </div>
          <p className="max-w-[420px] text-[14px] leading-6 text-gray-600">
            {amountLabel ? <>Your borrow of <span className="font-semibold text-gray-900">{amountLabel}</span> was processed successfully.</> : <>Your borrow was processed successfully.</>}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <button type="button" className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer" onClick={onClose}>Done</button>
          <button type="button" className="w-1/2 rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer" onClick={() => (onViewReceipt ? onViewReceipt() : onClose())}>View receipt</button>
        </div>

        <style jsx>{`
          .celebrate-pop { display: inline-block; transform-origin: 50% 50%; animation: pop-in 420ms ease-out, floaty 2.8s ease-in-out 420ms infinite alternate; }
          @keyframes pop-in { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
          @keyframes floaty { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(-4px) rotate(2deg); } }
        `}</style>
      </div>
    </Modal>
  );
}


