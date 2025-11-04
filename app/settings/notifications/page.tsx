"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${checked ? "bg-black" : "bg-gray-200"}`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${checked ? "translate-x-7" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const [email, setEmail] = React.useState(true);
  const [push, setPush] = React.useState(false);
  const [sms, setSms] = React.useState(false);

  const dirty = email !== true || push !== false || sms !== false; // initial defaults above

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Notification settings" showBack />
        </div>

        <section className="mx-auto mt-6 max-w-[560px] space-y-10">
          <div className="flex items-center justify-between">
            <div className="text-[22px] font-medium leading-6">Email notifications</div>
            <Toggle checked={email} onChange={setEmail} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[22px] font-medium leading-6">Push notifications</div>
            <Toggle checked={push} onChange={setPush} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[22px] font-medium leading-6">SMS notifications</div>
            <Toggle checked={sms} onChange={setSms} />
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button
              type="button"
              disabled={!dirty}
              className={`w-full rounded-[20px] px-4 py-4 text-[16px] font-semibold ${dirty ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              onClick={() => { /* persist later */ }}
            >
              Save changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}


