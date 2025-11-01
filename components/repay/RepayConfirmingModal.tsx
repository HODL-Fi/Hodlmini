"use client";
import React from "react";
import Modal from "@/components/ui/Modal";

type RepayConfirmingModalProps = {
  open: boolean;
  onClose: () => void;
  amount: string;
  progress?: number; // 0-100 for determinate; omit for indeterminate
};

export default function RepayConfirmingModal({ open, onClose, amount, progress }: RepayConfirmingModalProps) {
  const [confirmExitOpen, setConfirmExitOpen] = React.useState(false);
  const [showSlow, setShowSlow] = React.useState(false);
  function requestClose() {
    setConfirmExitOpen(true);
  }

  React.useEffect(() => {
    if (!open) {
      setShowSlow(false);
      return;
    }
    // Only show slow hint for indeterminate mode
    if (typeof progress === "number") return;
    const t = window.setTimeout(() => setShowSlow(true), 60000);
    return () => window.clearTimeout(t);
  }, [open, progress]);

  return (
    <>
      <Modal open={open} onClose={onClose} closeOnOverlay={false} closeOnEscape={false}>
        <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[18px] font-semibold">Confirming payment</div>
            <div className="mt-1 text-[14px] text-gray-600">We're waiting for your bank to confirm the transfer of {amount}.</div>
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
              <div
                className="h-full rounded-full bg-[#2200FF] transition-[width] duration-200 ease-out"
                style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
              />
            </div>
          ) : (
            <div className="indeterminate h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="bar h-full w-1/3 rounded-full bg-[#2200FF]" />
            </div>
          )}
          <div className="mt-3 text-[12px] text-gray-600">This usually takes under a minute. You can keep this open while we confirm.</div>
          {showSlow && (
            <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
              Taking longer than usual. We’ll notify you once it’s confirmed.
            </div>
          )}
        </div>

        <style jsx>{`
          .indeterminate { position: relative; }
          .indeterminate .bar {
            position: relative;
            animation: slide 1.1s linear infinite;
          }
          @keyframes slide {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
        </div>
      </Modal>
      <Modal open={confirmExitOpen} onClose={() => setConfirmExitOpen(false)} closeOnOverlay={false} closeOnEscape={false}>
        <div className="space-y-3 text-center">
          <div className="text-[18px] font-semibold">Exit confirmation?</div>
          <p className="text-[14px] text-gray-600">We’re still waiting for confirmation. Do you want to leave?</p>
          <div className="mt-2 flex items-center gap-2">
            <button type="button" className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer" onClick={() => setConfirmExitOpen(false)}>
              Stay
            </button>
            <button type="button" className="w-1/2 rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer" onClick={() => { setConfirmExitOpen(false); onClose(); }}>
              Yes, leave
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}


