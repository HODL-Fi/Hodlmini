"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";

function PasswordInput({ label, value, onChange, placeholder = "", error, onToggle, shown }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | null;
  onToggle?: () => void;
  shown?: boolean;
}) {
  return (
    <div>
      <div className="text-[14px] text-gray-600">{label}</div>
      <div className="mt-2 flex items-center rounded-[14px] border border-gray-200 bg-white px-3 py-3">
        <input
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-[16px] outline-none"
        />
        {onToggle && (
          <button type="button" className="rounded-full px-2 py-1 text-[12px] text-[#2200FF] cursor-pointer" onClick={onToggle}>{shown ? "Hide" : "Show"}</button>
        )}
      </div>
      {error ? <div className="mt-1 text-[12px] text-red-600">{error}</div> : null}
    </div>
  );
}

export default function ChangePasswordPage() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNext, setShowNext] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [openSuccess, setOpenSuccess] = React.useState(false);

  const minLen = 8;
  const nextOk = next.length >= minLen;
  const confirmOk = confirm === next && nextOk;
  const canSave = current.length > 0 && nextOk && confirmOk;

  const strength = React.useMemo(() => {
    let s = 0;
    if (next.length >= minLen) s++;
    if (/[A-Z]/.test(next)) s++;
    if (/[0-9]/.test(next)) s++;
    if (/[^A-Za-z0-9]/.test(next)) s++;
    return Math.min(4, s);
  }, [next]);

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Change password" showBack />
        </div>

        <section className="mx-auto mt-6 max-w-[560px] space-y-5">
          <PasswordInput label="Current password" value={current} onChange={setCurrent} onToggle={()=>setShowCurrent(v=>!v)} shown={showCurrent} />
          <div>
            <PasswordInput label="New password" value={next} onChange={setNext} onToggle={()=>setShowNext(v=>!v)} shown={showNext} error={!nextOk && next ? `At least ${minLen} characters` : null} />
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className={`h-full rounded-full ${strength<=1?"bg-red-500":strength===2?"bg-yellow-500":strength===3?"bg-emerald-500":"bg-[#2200FF]"}`} style={{ width: `${(strength/4)*100}%` }} />
            </div>
          </div>
          <PasswordInput label="Confirm new password" value={confirm} onChange={setConfirm} onToggle={()=>setShowConfirm(v=>!v)} shown={showConfirm} error={!confirmOk && confirm ? "Passwords do not match" : null} />
        </section>

        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button type="button" disabled={!canSave} className={`w-full rounded-[20px] px-4 py-4 text-[16px] font-semibold ${canSave?"bg-[#2200FF] text-white cursor-pointer":"bg-gray-200 text-gray-500 cursor-not-allowed"}`} onClick={()=>setOpenSuccess(true)}>Save changes</button>
          </div>
        </div>
      </main>

      <Modal open={openSuccess} onClose={()=>setOpenSuccess(false)}>
        <div className="space-y-4">
          <div className="text-[18px] font-semibold">Password updated</div>
          <p className="text-[14px] text-gray-700">Your password has been changed successfully.</p>
          <div className="flex items-center justify-end">
            <button type="button" className="rounded-[14px] bg-[#2200FF] px-4 py-2 text-[14px] font-medium text-white" onClick={()=>setOpenSuccess(false)}>Done</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


