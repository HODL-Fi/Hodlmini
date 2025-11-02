"use client";
import React from "react";
import Modal from "@/components/ui/Modal";

type BorrowConfirmingModalProps = {
  open: boolean;
  onClose: () => void;
  amountLabel?: string; // e.g., ₦120,000.00
  progress?: number; // 0-100
};

export default function BorrowConfirmingModal({ open, onClose, amountLabel, progress }: BorrowConfirmingModalProps) {
  const [confirmExitOpen, setConfirmExitOpen] = React.useState(false);
  function requestClose() { setConfirmExitOpen(true); }

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[18px] font-semibold">Processing borrow</div>
              <div className="mt-1 text-[14px] text-gray-600">We’re finalizing your borrow{amountLabel ? ` of ${amountLabel}` : ""}. This won’t take long.</div>
            </div>
            <button type="button" aria-label="Close" onClick={requestClose} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            {typeof progress === "number" ? (
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-[#2200FF] transition-[width] duration-200 ease-out" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
              </div>
            ) : (
              <div className="indeterminate h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="bar h-full w-1/3 rounded-full bg-[#2200FF]" />
              </div>
            )}
            <div className="mt-3 text-[12px] text-gray-600">Please keep this open while we confirm.</div>
          </div>

          <style jsx>{`
            .indeterminate { position: relative; }
            .indeterminate .bar { position: relative; animation: slide 1.1s linear infinite; }
            @keyframes slide { 0% { transform: translateX(-120%); } 100% { transform: translateX(300%); } }
          `}</style>
        </div>
      </Modal>
      <Modal open={confirmExitOpen} onClose={() => setConfirmExitOpen(false)}>
        <div className="space-y-3 text-center">
          <div className="text-[18px] font-semibold">Exit confirmation?</div>
          <p className="text-[14px] text-gray-600">We’re still processing your borrow. Do you want to leave?</p>
          <div className="mt-2 flex items-center gap-2">
            <button type="button" className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer" onClick={() => setConfirmExitOpen(false)}>Stay</button>
            <button type="button" className="w-1/2 rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer" onClick={() => { setConfirmExitOpen(false); onClose(); }}>Yes, leave</button>
          </div>
        </div>
      </Modal>
    </>
  );
}


