"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlay?: boolean; // default true
  closeOnEscape?: boolean; // default true
};

export default function Modal({ open, onClose, children, closeOnOverlay = true, closeOnEscape = true }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, closeOnEscape]);

  if (!mounted) return null;
  return createPortal(
    <div
      className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div
        className={`absolute inset-x-0 bottom-0 transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto w-full max-w-[560px] px-2 pb-[max(env(safe-area-inset-bottom),8px)]">
          <div className="origin-bottom rounded-t-2xl bg-white p-4 shadow-lg">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


