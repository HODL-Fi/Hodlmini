"use client";
import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

type RepayModalProps = {
  open: boolean;
  onClose: () => void;
  amount: string; // e.g. ₦100,000.00
  accountNumber: string;
  bankName: string;
  accountName: string;
  seconds?: number; // default 30 * 60
  onConfirmSent?: () => void; // called when user clicks "I have sent the money"
  onCancelConfirmed?: () => void; // called only when user confirms cancel in the confirm sheet
};

export default function RepayModal({ open, onClose, amount, accountNumber, bankName, accountName, seconds = 30 * 60, onConfirmSent, onCancelConfirmed }: RepayModalProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [copiedNote, setCopiedNote] = useState<string | null>(null);
  const [sendingGuard, setSendingGuard] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRemaining(seconds);
  }, [open, seconds]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [open]);

  const timeText = useMemo(() => {
    const m = Math.floor(remaining / 60)
      .toString()
      .padStart(2, "0");
    const s = (remaining % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [remaining]);

  const copy = (text: string, note: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedNote(note);
      window.setTimeout(() => setCopiedNote(null), 1200);
    } catch {}
  };

  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  function requestClose() {
    setConfirmExitOpen(true);
  }

  return (
    <>
      <Modal open={open} onClose={onClose} closeOnOverlay={false} closeOnEscape={false}>
        <div className="relative space-y-4">
        {copiedNote && (
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-900/90 px-3 py-1 text-[12px] text-white shadow">
            {copiedNote}
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="text-[24px] font-semibold">Repay loan</div>
          <button type="button" aria-label="Close" onClick={requestClose} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-[16px] leading-6 text-gray-700">
          Great move! You are about to repay your loan of <span className="font-semibold text-gray-900">{amount}</span>. Send the money from
          your choice bank app to the account details below.
        </p>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <Field label="Account number" value={accountNumber} onCopy={() => copy(accountNumber, "Account number copied")} />
          <div className="h-4" />
          <Field label="Bank name" value={bankName} onCopy={() => copy(bankName, "Bank name copied")} />
          <div className="h-4" />
          <Field label="Account name" value={accountName} onCopy={() => copy(accountName, "Account name copied")} />
          <div className="h-4" />
          <div className="flex items-center justify-between">
            <div className="text-[14px] font-medium text-gray-600">Time left</div>
            <div className="text-[18px] font-semibold text-red-500">{timeText}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button type="button" className="w-1/2 rounded-[20px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer" onClick={requestClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`w-1/2 rounded-[20px] px-4 py-3 text-[14px] font-medium text-white cursor-pointer ${remaining === 0 ? "bg-gray-400 opacity-60" : "bg-[#2200FF]"}`}
            disabled={remaining === 0 || sendingGuard}
            onClick={() => {
              if (remaining === 0) {
                setCopiedNote("Payment details expired");
                window.setTimeout(() => setCopiedNote(null), 1200);
                return;
              }
              if (!navigator.onLine) {
                setCopiedNote("You are offline");
                window.setTimeout(() => setCopiedNote(null), 1200);
                return;
              }
              if (sendingGuard) return;
              setSendingGuard(true);
              onClose();
              onConfirmSent?.();
              window.setTimeout(() => setSendingGuard(false), 1500);
            }}
          >
            I have sent the money
          </button>
        </div>

        <div className="pt-2 text-center text-[12px] text-gray-500">
          Powered by <span className="font-semibold">Paystack</span>
        </div>
        </div>
      </Modal>

      {/* Are you sure dialog */}
      <Modal open={confirmExitOpen} onClose={() => setConfirmExitOpen(false)} closeOnOverlay={false} closeOnEscape={false}>
        <div className="space-y-3 text-center">
          <div className="text-[18px] font-semibold">Cancel repayment?</div>
          <p className="text-[14px] text-gray-600">You can resume anytime, but your loan remains pending until payment is confirmed.</p>
          <div className="mt-2 flex items-center gap-2">
            <button type="button" className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer" onClick={() => setConfirmExitOpen(false)}>
              Stay
            </button>
            <button
              type="button"
              className="w-1/2 rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer"
              onClick={() => {
                setConfirmExitOpen(false);
                onClose();
                onCancelConfirmed?.();
              }}
            >
              Yes, cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Field({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
      <div>
        <div className="text-[18px] font-semibold text-gray-900">{value}</div>
        <div className="text-[12px] text-gray-600">{label}</div>
      </div>
      <button type="button" aria-label="Copy" onClick={onCopy} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer" title="Copy">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
    </div>
  );
}


