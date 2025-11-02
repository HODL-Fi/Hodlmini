"use client";
import React from "react";
import Modal from "@/components/ui/Modal";

export default function ProcessingModal({ open, onClose, title, hint, progress }: {
  open: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  progress?: number; // 0-100
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="text-[18px] font-semibold">{title}</div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="rounded-2xl border border-gray-200 p-4">
          {typeof progress === "number" ? (
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#2200FF] transition-[width] duration-200 ease-out" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} /></div>
          ) : (
            <div className="indeterminate h-2 w-full overflow-hidden rounded-full bg-gray-200"><div className="bar h-full w-1/3 rounded-full bg-[#2200FF]" /></div>
          )}
          {hint && <div className="mt-3 text-[12px] text-gray-600">{hint}</div>}
        </div>
        <style jsx>{`
          .indeterminate { position: relative; }
          .indeterminate .bar { position: relative; animation: slide 1.1s linear infinite; }
          @keyframes slide { 0% { transform: translateX(-120%); } 100% { transform: translateX(300%); } }
        `}</style>
      </div>
    </Modal>
  );
}


