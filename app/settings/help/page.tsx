"use client";

import React from "react";
import Image from "next/image";
import BorrowTopNav from "@/components/BorrowTopNav";

export default function HelpPage() {
  const socials = [
    { key: "twitter", name: "Twitter", icon: "/socials/twitter.png", href: "https://twitter.com/" },
    { key: "instagram", name: "Instagram", icon: "/socials/instagram.png", href: "https://instagram.com/" },
    { key: "linkedin", name: "LinkedIn", icon: "/socials/linkedin.png", href: "https://linkedin.com/" },
    { key: "tiktok", name: "TikTok", icon: "/socials/tiktok.png", href: "https://tiktok.com/" },
  ];
  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Help" showBack />
        </div>

        <section className="mx-auto mt-6 max-w-[560px] space-y-6">
          <div>
            <div className="text-[18px] font-semibold">Getting started</div>
            <ul className="mt-2 list-disc pl-5 text-[14px] text-gray-700">
              <li>Create or import your wallets from Home.</li>
              <li>Deposit crypto via Wallet → Receive. Your address QR is provided.</li>
              <li>To borrow, navigate to Borrow, pick assets as collateral, set receive amount, and confirm.</li>
              <li>Repay via Repayments; partial payments supported.</li>
              <li>Manage collateral in Vault (deposit/withdraw and monitor Health Factor).</li>
            </ul>
          </div>

          <div>
            <div className="text-[18px] font-semibold">Best practices</div>
            <ul className="mt-2 list-disc pl-5 text-[14px] text-gray-700">
              <li>Keep Health Factor comfortably above 1.2 to avoid liquidation risk.</li>
              <li>Use multiple assets as collateral for diversification.</li>
              <li>Always verify repayment bank details in the Repay modal.</li>
            </ul>
          </div>

          <div>
            <div className="text-[18px] font-semibold">Support</div>
            <p className="mt-2 text-[14px] text-gray-700">Email: <a href="mailto:support@hodlmini.app" className="text-[#2200FF] underline">support@hodlmini.app</a></p>
          </div>

          <div>
            <div className="text-[18px] font-semibold">Follow us</div>
            <div className="mt-3 flex items-center gap-4 flex-wrap">
              {socials.map((s) => (
                <a key={s.key} href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-[14px] hover:bg-gray-50">
                  <Image src={s.icon} alt={s.name} width={18} height={18} />
                  <span>{s.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


