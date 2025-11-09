"use client";

import React from "react";
import Image from "next/image";
import BorrowTopNav from "@/components/BorrowTopNav";

export default function ReferralPage() {
  const [copied, setCopied] = React.useState(false);
  // Demo referral code/link; swap for real user code when backend is ready
  const code = "HODL-2K9X3";
  const link = `https://app.joinhodl.com/referral?code=${encodeURIComponent(code)}`;
  // Demo points; replace with user data when available
  const pointsPerReferral = 100;
  const referralsCount = 8;
  const totalPoints = pointsPerReferral * referralsCount;
  const shortLink = React.useMemo(() => {
    const head = 12;
    const tail = 6;
    if (!link) return "";
    if (link.length <= head + tail + 3) return link;
    return `${link.slice(0, head)}...${link.slice(-tail)}`;
  }, [link]);

  function copy(text: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Referral" showBack />
        </div>

        <section className="mx-auto mt-6 max-w-[560px] space-y-6">
          {/* Points summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Image src="/icons/coin.svg" alt="HODL Coins" width={24} height={24} />
                </span>
                <div>
                  <div className="text-[12px] text-gray-600">Your balance</div>
                  <div className="text-[18px] font-semibold">HODL Coins</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[28px] font-semibold leading-7">{totalPoints.toLocaleString()}</div>
                <div className="text-[12px] text-gray-600">{referralsCount} referrals · +{pointsPerReferral} each</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Image src="/settings/refer.svg" alt="Refer" width={20} height={20} />
              </span>
              <div className="flex-1">
                <div className="text-[18px] font-semibold">Invite friends, grow HODL</div>
                <div className="mt-1 text-[13px] text-gray-600">
                  Share your referral link. When friends join, you both get perks in future campaigns.
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="text-[12px] text-gray-600">Your code</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate text-[16px] font-semibold tracking-wide">{code}</div>
                  <button
                    type="button"
                    className="shrink-0 rounded-full px-3 py-1 text-[12px] bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    onClick={() => copy(code)}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="text-[12px] text-gray-600">Referral link</div>
                <div className="mt-1 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1 text-[14px]">
                    <span className="sm:hidden">{shortLink}</span>
                    <span className="hidden sm:inline truncate">{link}</span>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[12px] bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    onClick={() => copy(link)}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Join me on HODL: " + link)}`} target="_blank" rel="noreferrer" className="rounded-full border border-gray-200 bg-white px-3 py-2 text-[14px] hover:bg-gray-50">
                Share on X
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join me on HODL")}`} target="_blank" rel="noreferrer" className="rounded-full border border-gray-200 bg-white px-3 py-2 text-[14px] hover:bg-gray-50">
                Share on Telegram
              </a>
              <button
                type="button"
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-[14px] hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "HODL", text: "Join me on HODL", url: link }).catch(() => {});
                  } else {
                    copy(link);
                  }
                }}
              >
                Share…
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-[16px] font-semibold">How referrals work</div>
            <ul className="mt-2 list-disc pl-5 text-[14px] text-gray-700">
              <li>Share your unique link with friends.</li>
              <li>For each friend who joins, you earn <span className="font-medium">+{pointsPerReferral} HODL Coins</span>.</li>
              <li>Coins power future perks, airdrops and campaigns. Details will be announced in-app and on socials.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}


