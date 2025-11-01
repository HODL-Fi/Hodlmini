"use client";

import React from "react";
import DropdownPill from "@/components/inputs/DropdownPill";
import Modal from "@/components/ui/Modal";

type CustomInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  tokenLabel: string;
  tokenIconSrc?: string;
  onDropdownClick?: () => void; // external handler to launch a parent modal/sheet
  useBuiltInModal?: boolean; // if true, we open our own Modal
  renderDropdownModalContent?: () => React.ReactNode; // optional custom modal content
  invalid?: boolean; // styles the field red and adds a brief shake animation
};

export default function CustomInput({ value, onChange, placeholder = "0", disabled, readOnly, tokenLabel, tokenIconSrc, onDropdownClick, useBuiltInModal, renderDropdownModalContent, invalid }: CustomInputProps) {
  const [open, setOpen] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  React.useEffect(() => {
    if (invalid) {
      // retrigger shake each time invalid turns true
      setShake(false);
      const t = window.setTimeout(() => setShake(true), 10);
      const t2 = window.setTimeout(() => setShake(false), 380);
      return () => { window.clearTimeout(t); window.clearTimeout(t2); };
    }
    setShake(false);
  }, [invalid, value]);

  function handleDropdown() {
    onDropdownClick?.();
    if (useBuiltInModal) setOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(",", ".");
    if (/^\d*(?:\.\d*)?$/.test(raw) || raw === "") {
      onChange(raw);
    }
  }

  return (
    <>
      <div className={`relative w-full rounded-[16px] p-3 shadow-sm bg-white ${invalid ? "border border-red-500" : "border border-gray-200"} ${shake ? "shake-x" : ""}`}>
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full pr-28 text-[28px] font-medium leading-[34px] placeholder:text-gray-400 outline-none bg-transparent ${invalid ? "text-red-600" : "text-gray-900"}`}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-0 focus-within:ring-2 focus-within:ring-[#2200FF]/40" />

        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <DropdownPill label={tokenLabel} iconSrc={tokenIconSrc} onClick={handleDropdown} />
        </div>
      </div>
      

      {useBuiltInModal && (
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[18px] font-semibold">Select asset</div>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="text-[14px] text-gray-600">This opens the asset selection modal. We’ll wire the full UX next.</div>
            {renderDropdownModalContent?.()}
          </div>
        </Modal>
      )}
    </>
  );
}


