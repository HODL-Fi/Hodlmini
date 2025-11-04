"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import BorrowTopNav from "@/components/BorrowTopNav";
import LogoutModal from "@/components/settings/LogoutModal";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";

type Item = {
  key: string;
  label: string;
  icon: string;
  href?: string;
  right?: React.ReactNode;
  danger?: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const userEmail = "jasperjed@mail.xyz";
  const [delEmailOpen, setDelEmailOpen] = React.useState(false);
  const [delSureOpen, setDelSureOpen] = React.useState(false);
  const [delCountdownOpen, setDelCountdownOpen] = React.useState(false);
  const [emailInput, setEmailInput] = React.useState("");
  const emailMatch = emailInput.trim().toLowerCase() === userEmail;
  const [seconds, setSeconds] = React.useState(7);
  const countdownRef = React.useRef<number | null>(null);
  const [navigateHome, setNavigateHome] = React.useState(false);

  React.useEffect(() => {
    if (navigateHome) {
      router.push("/home");
      setNavigateHome(false);
    }
  }, [navigateHome, router]);
  const items: Item[] = [
    { key: "profile", label: "Profile", icon: "/settings/profile.svg", href: "/settings/profile" },
    { key: "password", label: "Change password", icon: "/settings/key.svg", href: "/settings/password" },
    {
      key: "verifications",
      label: "Verifications",
      icon: "/settings/document.svg",
      href: "/settings/verification",
      right: (
        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-medium text-yellow-700">Pending</span>
      ),
    },
    { key: "linked", label: "Linked accounts", icon: "/settings/building-library.svg", href: "/settings/linked" },
    { key: "notif", label: "Notification settings", icon: "/settings/bell.svg", href: "/settings/notifications" },
    { key: "help", label: "Help", icon: "/settings/help.svg", href: "/settings/help" },
    { key: "terms", label: "Terms & privacy", icon: "/settings/document.svg", href: "/settings/terms" },
    { key: "logout", label: "Logout", icon: "/settings/power.svg" },
    { key: "delete", label: "Delete account", icon: "/settings/trash.svg", href: "/coming-soon", danger: true },
  ];

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Settings" subtitle="Make changes that fits your style" />
        </div>

        <section className="mt-3 divide-y divide-gray-100 rounded-2xl bg-white">
          {items.map((it) => {
            const Row = (
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Image src={it.icon} alt="" width={20} height={20} />
                  </span>
                  <span className={`text-[16px] ${it.danger ? "text-red-600" : "text-gray-900"}`}>{it.label}</span>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  {it.right}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            );
            if (it.key === "logout") {
              return (
                <button key={it.key} type="button" className="block w-full text-left hover:bg-gray-50" onClick={() => setLogoutOpen(true)}>
                  {Row}
                </button>
              );
            }
            if (it.key === "delete") {
              return (
                <button key={it.key} type="button" className="block w-full text-left hover:bg-gray-50" onClick={() => { setEmailInput(""); setDelEmailOpen(true); }}>
                  {Row}
                </button>
              );
            }
            return (
              <Link key={it.key} href={it.href ?? "#"} className="block hover:bg-gray-50">{Row}</Link>
            );
          })}
        </section>
        <LogoutModal
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          onConfirm={() => {
            // simulate logout
            router.push("/home");
          }}
        />

        {/* Delete email confirm */}
        <Modal open={delEmailOpen} onClose={() => setDelEmailOpen(false)}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-[24px] font-semibold leading-6">Confirm deletion</div>
              <button type="button" aria-label="Close" onClick={() => setDelEmailOpen(false)} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <p className="text-[16px] leading-7 text-gray-700">To confirm deletion of this account, please enter the email address attached to this account.</p>
            <div>
              <div className="text-[14px] text-gray-600">Email address</div>
              <input value={emailInput} onChange={(e)=>setEmailInput(e.target.value)} placeholder="Email address" className="mt-2 w-full rounded-[14px] border border-gray-200 bg-white px-3 py-3 text-[16px] outline-none" />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <button type="button" className="w-1/2 rounded-[18px] bg-gray-200 px-4 py-3 text-[14px] font-semibold text-gray-800 cursor-pointer" disabled={!emailMatch} onClick={() => { setDelEmailOpen(false); setDelSureOpen(true); }}>Delete</button>
              <button type="button" className="w-1/2 rounded-[18px] bg-[#EF4444] px-4 py-3 text-[14px] font-semibold text-white cursor-pointer" onClick={() => setDelEmailOpen(false)}>Cancel</button>
            </div>
          </div>
        </Modal>

        {/* Delete are-you-sure */}
        <Modal open={delSureOpen} onClose={() => setDelSureOpen(false)}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-[24px] font-semibold leading-6">Delete account</div>
              <button type="button" aria-label="Close" onClick={() => setDelSureOpen(false)} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <p className="text-[16px] leading-7 text-gray-700">You are about to delete this account. By deleting this account, you will lose all your finances and lose access all the financial activities on HODL. Are you sure you want to delete?</p>
            <div className="flex items-center gap-3">
              <button type="button" className="w-1/2 rounded-[18px] bg-gray-200 px-4 py-3 text-[14px] font-semibold text-gray-800" onClick={() => {
                setDelSureOpen(false);
                setSeconds(7);
                setDelCountdownOpen(true);
                if (countdownRef.current) window.clearInterval(countdownRef.current);
                countdownRef.current = window.setInterval(() => {
                  setSeconds((s) => {
                    if (s <= 1) {
                      if (countdownRef.current) window.clearInterval(countdownRef.current);
                      countdownRef.current = null;
                      setDelCountdownOpen(false);
                      // trigger navigation outside render via effect
                      setNavigateHome(true);
                      return 0;
                    }
                    return s - 1;
                  });
                }, 1000) as unknown as number;
              }}>Yes, delete</button>
              <button type="button" className="w-1/2 rounded-[18px] bg-[#EF4444] px-4 py-3 text-[14px] font-semibold text-white" onClick={() => setDelSureOpen(false)}>No, cancel</button>
            </div>
          </div>
        </Modal>

        {/* Countdown modal */}
        <Modal open={delCountdownOpen} onClose={() => setDelCountdownOpen(false)}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-[24px] font-semibold leading-6">Deleting account…</div>
              <button type="button" aria-label="Close" onClick={() => { setDelCountdownOpen(false); if (countdownRef.current) { window.clearInterval(countdownRef.current); countdownRef.current = null; } }} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <p className="text-[16px] leading-7 text-gray-700">Account will be permanently deleted in <span className="font-semibold">{seconds}s</span>.</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-[#EF4444] transition-[width] duration-300" style={{ width: `${Math.max(0, (7 - seconds) / 7 * 100)}%` }} />
            </div>
            <div className="flex items-center justify-end">
              <button type="button" className="rounded-[18px] bg-gray-200 px-4 py-3 text-[14px] font-semibold text-gray-800" onClick={() => { setDelCountdownOpen(false); if (countdownRef.current) { window.clearInterval(countdownRef.current); countdownRef.current = null; } }}>Cancel</button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}

 
