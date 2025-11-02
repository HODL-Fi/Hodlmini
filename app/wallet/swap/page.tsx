"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";
import { CustomInput } from "@/components/inputs";
import Image from "next/image";
import TxConfirmModal from "@/components/wallet/TxConfirmModal";
import ProcessingModal from "@/components/wallet/ProcessingModal";
import TxSuccessModal from "@/components/wallet/TxSuccessModal";
import TxFailedModal from "@/components/wallet/TxFailedModal";

export default function SwapPage() {
  const ASSETS = React.useMemo(() => ([
    { symbol: "ETH", name: "Ethereum", icon: "/assets/eth.svg" },
    { symbol: "USDT", name: "Tether", icon: "/assets/usdt.svg" },
    { symbol: "USDC", name: "USD Coin", icon: "/assets/usdc.svg" },
    { symbol: "DAI", name: "DAI", icon: "/assets/dai.svg" },
  ]), []);

  const [fromOpen, setFromOpen] = React.useState(false);
  const [toOpen, setToOpen] = React.useState(false);
  const [from, setFrom] = React.useState(ASSETS[0]);
  const [to, setTo] = React.useState(ASSETS[2]);
  const [amount, setAmount] = React.useState("");
  const rate = 1; // mock 1:1
  const receive = React.useMemo(() => {
    const v = parseFloat((amount || "0").replace(/,/g, ""));
    return Number.isFinite(v) ? v * rate : 0;
  }, [amount]);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [processingOpen, setProcessingOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [failedOpen, setFailedOpen] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const canSwap = Boolean(amount) && from.symbol !== to.symbol;

  return (
    <div className="min-h-dvh">
      <main className="px-2 py-4 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Swap" subtitle="Instantly swap assets" />
        </div>

        <section className="mt-4 space-y-4">
          <div>
            <div className="text-[14px] text-gray-600">From</div>
            <CustomInput value={amount} onChange={setAmount} tokenLabel={from.symbol} tokenIconSrc={from.icon} onDropdownClick={()=>setFromOpen(true)} />
          </div>
          <div className="text-center text-[12px] text-gray-600">Rate: 1 {from.symbol} ≈ {rate} {to.symbol}</div>
          <div>
            <div className="text-[14px] text-gray-600">To</div>
            <button type="button" className="mt-1 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-white px-3 py-3 cursor-pointer" onClick={() => setToOpen(true)}>
              <div className="flex items-center gap-2"><Image src={to.icon} alt={to.symbol} width={20} height={20} /><span className="text-[14px] font-medium">{to.name}</span></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="mt-1 text-[12px] text-gray-600">You receive ≈ {receive.toFixed(4)} {to.symbol}</div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)] z-10">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button type="button" disabled={!canSwap} className={`w-full rounded-[20px] px-4 py-3 text-[14px] font-medium text-center ${canSwap ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`} onClick={()=>setConfirmOpen(true)}>Swap</button>
          </div>
        </div>

        {/* From asset */}
        <Modal open={fromOpen} onClose={()=>setFromOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select asset</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {ASSETS.map((a)=> (
                <button key={a.symbol} type="button" onClick={()=>{ setFrom(a); setFromOpen(false); }} className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50">
                  <Image src={a.icon} alt={a.symbol} width={24} height={24} />
                  <div className="text-[14px]">{a.name}</div>
                </button>
              ))}
            </div>
          </div>
        </Modal>
        {/* To asset */}
        <Modal open={toOpen} onClose={()=>setToOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select asset</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {ASSETS.map((a)=> (
                <button key={a.symbol} type="button" onClick={()=>{ setTo(a); setToOpen(false); }} className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50">
                  <Image src={a.icon} alt={a.symbol} width={24} height={24} />
                  <div className="text-[14px]">{a.name}</div>
                </button>
              ))}
            </div>
          </div>
        </Modal>

        <TxConfirmModal
          open={confirmOpen}
          onClose={()=>setConfirmOpen(false)}
          title="Confirm swap"
          rows={[
            { label: "From", value: `${amount || "0"} ${from.symbol}` },
            { label: "To", value: `${receive.toFixed(4)} ${to.symbol}` },
            { label: "Rate", value: `1 ${from.symbol} ≈ ${rate} ${to.symbol}` },
            { label: "Fee", value: "$0.00" },
          ]}
          confirmLabel="Swap now"
          onConfirm={()=>{
            setConfirmOpen(false);
            setProgress(0);
            setProcessingOpen(true);
            const start = Date.now();
            const total = 1600;
            const t = window.setInterval(()=>{
              const p = Math.min(100, Math.round(((Date.now()-start)/total)*100));
              setProgress(p);
              if (p>=100) { window.clearInterval(t); setProcessingOpen(false); setSuccessOpen(true); }
            }, 120);
          }}
        />
        <ProcessingModal open={processingOpen} onClose={()=>setProcessingOpen(false)} title="Processing swap" progress={progress} />
        <TxSuccessModal open={successOpen} onClose={()=>setSuccessOpen(false)} onViewReceipt={()=>setSuccessOpen(false)} />
        <TxFailedModal open={failedOpen} onClose={()=>setFailedOpen(false)} onRetry={()=>{ setFailedOpen(false); setConfirmOpen(true); }} />
      </main>
    </div>
  );
}


