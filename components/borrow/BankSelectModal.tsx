"use client";
import Image from "next/image";
import React from "react";
import Modal from "@/components/ui/Modal";

export type BankAccount = {
  id: string;
  name: string; // Account name
  number: string; // Account number
  bank: string; // Bank display name
  logo?: string; // e.g., /banks/uba.svg
};

type BankSelectModalProps = {
  open: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onAddBank?: () => void;
  onConfirmBorrow: () => void;
};

export default function BankSelectModal({ open, onClose, accounts, selectedId, onSelect, onAddBank, onConfirmBorrow }: BankSelectModalProps) {
  const canBorrow = Boolean(selectedId);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="text-[24px] font-semibold leading-6">Select bank account</div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden bg-white">
          {accounts.map((acc) => {
            const active = acc.id === selectedId;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onSelect(acc.id)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 cursor-pointer"
              >
                <Image src={acc.logo || "/banks/bank.svg"} alt={acc.bank} width={44} height={44} className="rounded-full" />
                <div className="flex-1">
                  <div className="text-[18px] font-medium leading-6 text-gray-900">{acc.name}</div>
                  <div className="mt-0.5 text-[12px] leading-4 text-gray-600">{acc.number} <span className="mx-1">|</span> {acc.bank}</div>
                </div>
                <span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border" style={{ borderColor: active ? "#16a34a" : "#d1d5db", background: active ? "#ecfdf5" : "transparent" }}>
                  {active ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onAddBank}
          className="inline-flex items-center gap-2 text-[16px] font-medium text-gray-800 underline underline-offset-4 cursor-pointer"
        >
          Add another bank
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canBorrow}
            className={`w-1/2 rounded-[14px] px-4 py-3 text-[14px] font-medium text-white ${canBorrow ? "bg-[#2200FF] cursor-pointer" : "bg-gray-300 cursor-not-allowed"}`}
            onClick={() => { if (canBorrow) onConfirmBorrow(); }}
          >
            Borrow
          </button>
        </div>
      </div>
    </Modal>
  );
}


