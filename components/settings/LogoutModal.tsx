"use client";

import React from "react";
import Modal from "@/components/ui/Modal";

export default function LogoutModal({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="text-[24px] font-semibold leading-6">Logout</div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <p className="text-[16px] leading-7 text-gray-700">
          You are about to logout from this account. By logging out, you will not be able to borrow, send money or carry out any other financial activity. Are you sure you want to logout?
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className="w-1/2 rounded-[18px] bg-gray-200 px-4 py-3 text-[14px] font-semibold text-gray-800 cursor-pointer"
            onClick={onClose}
          >
            No, cancel
          </button>
          <button
            type="button"
            className="w-1/2 rounded-[18px] bg-[#EF4444] px-4 py-3 text-[14px] font-semibold text-white cursor-pointer"
            onClick={() => { onConfirm?.(); onClose(); }}
          >
            Yes, logout
          </button>
        </div>
      </div>
    </Modal>
  );
}


