"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { useFont, availableFonts } from "@/contexts/FontContext";

export default function FontSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { selectedFont, setSelectedFont } = useFont();

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="text-[22px] font-semibold leading-6">Select Font</div>
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
        <p className="text-[14px] text-gray-600">Choose a font to use throughout the app</p>
        <div className="max-h-[400px] overflow-y-auto space-y-1">
          {availableFonts.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => {
                setSelectedFont(font);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-[16px] transition-colors ${
                selectedFont.id === font.id
                  ? "bg-[#2200FF] text-white"
                  : "hover:bg-gray-100 text-gray-900"
              }`}
              style={{
                fontFamily: `var(${font.cssVariable}), Arial, Helvetica, sans-serif`,
              }}
            >
              <div className="flex items-center justify-between">
                <span>{font.name}</span>
                {selectedFont.id === font.id && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="pt-3 border-t border-gray-200 text-[13px] text-gray-500">
          Current selection: <span className="font-semibold text-gray-700">{selectedFont.name}</span>
        </div>
      </div>
    </Modal>
  );
}

