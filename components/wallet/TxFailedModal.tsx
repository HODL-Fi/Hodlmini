"use client";
import React from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

export default function TxFailedModal({ open, onClose, title = "Transaction failed", message, onRetry }: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: React.ReactNode;
  onRetry?: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="text-[18px] font-semibold">{title}</div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3"><Image src="/icons/sad.svg" alt="Failed" width={96} height={96} className="shake-violent" /></div>
          <p className="max-w-[420px] text-[14px] leading-6 text-gray-600">{message ?? "We couldn't complete your transaction. Please try again."}</p>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <button type="button" className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer" onClick={onClose}>Close</button>
          <button type="button" className="w-1/2 rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer" onClick={() => (onRetry ? onRetry() : onClose())}>Try again</button>
        </div>
        <style jsx>{`
          .shake-violent { display: inline-block; transform-origin: 50% 50%; animation: shake-violent 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite both; }
          @keyframes shake-violent {
            0% { transform: translateX(0) rotate(0deg) scale(1); }
            10% { transform: translateX(-8px) rotate(-10deg) scale(1.02); }
            20% { transform: translateX(8px) rotate(10deg) }
            30% { transform: translateX(-10px) rotate(-12deg) }
            40% { transform: translateX(10px) rotate(12deg) }
            50% { transform: translateX(-8px) rotate(-10deg) }
            60% { transform: translateX(8px) rotate(10deg) }
            70% { transform: translateX(-6px) rotate(-8deg) }
            80% { transform: translateX(6px) rotate(8deg) }
            90% { transform: translateX(-3px) rotate(-4deg) }
            100% { transform: translateX(0) rotate(0deg) scale(1); }
          }
        `}</style>
      </div>
    </Modal>
  );
}


