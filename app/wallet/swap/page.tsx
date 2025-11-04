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
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const CHAINS = React.useMemo(() => ([
    { key: "ETH", name: "Ethereum", icon: "/chains/ethereum.svg" },
    { key: "BSC", name: "BNB Smart Chain", icon: "/chains/bsc.svg" },
    { key: "LSK", name: "Lisk", icon: "/chains/lisk.svg" },
    { key: "BASE", name: "Base", icon: "/chains/base.svg" },
  ]), []);
  const ASSETS = React.useMemo(() => ([
    { symbol: "ETH", name: "Ethereum", icon: "/assets/eth.svg" },
    { symbol: "USDT", name: "Tether", icon: "/assets/usdt.svg" },
    { symbol: "USDC", name: "USD Coin", icon: "/assets/usdc.svg" },
    { symbol: "DAI", name: "DAI", icon: "/assets/dai.svg" },
  ]), []);

  const [fromOpen, setFromOpen] = React.useState(false);
  const [toOpen, setToOpen] = React.useState(false);
  const [chainOpen, setChainOpen] = React.useState(false);
  const [from, setFrom] = React.useState(ASSETS[0]);
  const [to, setTo] = React.useState(ASSETS[2]);
  const [selectedChain, setSelectedChain] = React.useState(CHAINS[0]);
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

  // Quote/Slippage/Fees
  const [slippagePct, setSlippagePct] = React.useState<number>(0.5); // %
  const priceImpactPct = 0.02; // mock %
  const networkFeeUsd = 0.25; // mock usd
  const minReceived = React.useMemo(() => Math.max(0, receive * (1 - slippagePct / 100)), [receive, slippagePct]);

  // Mock balances per chain
  const BALANCES = React.useMemo(() => ({
    ETH: { ETH: 1.12, USDT: 1109, USDC: 119.87, DAI: 50 },
    BSC: { USDT: 1000, ETH: 0, USDC: 0, DAI: 0 },
    LSK: { ETH: 0.1 },
    BASE: { ETH: 0.05 },
  } as Record<string, Record<string, number>>), []);
  const fromBalance = BALANCES[selectedChain.key]?.[from.symbol] ?? 0;
  function formatAmount(n: number) { return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 6 }).format(n); }

  const canSwap = Boolean(amount) && from.symbol !== to.symbol;

  if (!mounted) {
    return (
      <div className="min-h-dvh">
        <main className="px-3 text-left" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Swap" subtitle="Instantly swap assets" showBack />
        </div>

        <section className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[14px] text-gray-600">Network</div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-[13px] font-medium cursor-pointer"
              onClick={() => setChainOpen(true)}
            >
              <Image src={selectedChain.icon} alt={selectedChain.name} width={16} height={16} />
              {selectedChain.name}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          <div>
            <div className="text-[14px] text-gray-600">From</div>
            <CustomInput value={amount} onChange={setAmount} tokenLabel={from.symbol} tokenIconSrc={from.icon} onDropdownClick={()=>setFromOpen(true)} />
            <div className="mt-1 flex items-center justify-between text-[12px] text-gray-600">
              <div>Wallet balance: {formatAmount(fromBalance)} {from.symbol}</div>
              <button
                type="button"
                className="text-[#2200FF] cursor-pointer"
                onClick={() => setAmount(String(fromBalance))}
              >
                Max
              </button>
            </div>
          </div>
          <div className="text-left text-[12px] text-gray-600">Rate: 1 {from.symbol} ≈ {rate} {to.symbol}</div>

          {/* Swap icon between inputs */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              aria-label="Flip tokens"
              onClick={() => { const f = from; setFrom(to); setTo(f); }}
              className="-my-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              <Image src="/icons/swap.svg" alt="Swap" width={18} height={18} />
            </button>
          </div>

          <div>
            <div className="text-[14px] text-gray-600">To</div>
            <CustomInput
              value={receive.toFixed(6)}
              onChange={() => { /* derived */ }}
              readOnly
              tokenLabel={to.symbol}
              tokenIconSrc={to.icon}
              onDropdownClick={()=>setToOpen(true)}
            />
            <div className="mt-1 text-[12px] text-gray-600">You receive ≈ {receive.toFixed(6)} {to.symbol}</div>
          </div>
        </section>

        {/* Quote & Settings */}
        <section className="mt-4 rounded-[16px] border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between text-[14px]">
            <div className="text-gray-600">Quote details</div>
            <div className="text-[12px] text-gray-500">{selectedChain.name}</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[14px]">
            <div className="text-gray-600">Min received</div>
            <div className="text-right font-semibold">{minReceived.toFixed(6)} {to.symbol}</div>
            <div className="text-gray-600">Price impact</div>
            <div className="text-right font-semibold">{priceImpactPct.toFixed(2)}%</div>
            <div className="text-gray-600">Network fee</div>
            <div className="text-right font-semibold">${networkFeeUsd.toFixed(2)}</div>
            <div className="text-gray-600">Estimated time</div>
            <div className="text-right font-semibold">≈ 30s</div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-[14px] text-gray-600">Slippage tolerance</div>
            <div className="flex flex-wrap gap-2">
              {[0.1, 0.5, 1].map((pct) => {
                const active = slippagePct === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setSlippagePct(pct)}
                    className={`rounded-full px-3 py-1.5 text-[12px] ${active ? "bg-[#2200FF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    {pct}%
                  </button>
                );
              })}
              <SlippageEditor value={slippagePct} onChange={setSlippagePct} />
            </div>
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

        {/* Chain modal */}
        <Modal open={chainOpen} onClose={()=>setChainOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select network</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {CHAINS.map((c)=> (
                <button key={c.key} type="button" onClick={()=>{ setSelectedChain(c); setChainOpen(false); }} className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50">
                  <Image src={c.icon} alt={c.name} width={24} height={24} />
                  <div className="text-[14px]">{c.name}</div>
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
            { label: "Network", value: selectedChain.name },
            { label: "Slippage", value: `${slippagePct}%` },
            { label: "Min received", value: `${minReceived.toFixed(6)} ${to.symbol}` },
            { label: "Fee", value: `$${networkFeeUsd.toFixed(2)}` },
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


function SlippageEditor({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState(String(value));
  React.useEffect(() => setInput(String(value)), [value]);
  return (
    <>
      <button
        type="button"
        className="rounded-full bg-gray-100 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-200"
        onClick={() => setOpen(true)}
      >
        Custom
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="text-[18px] font-semibold">Custom slippage</div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e)=>{
                const raw = e.target.value.replace(",", ".");
                if (/^\d*(?:\.\d*)?$/.test(raw) || raw === "") setInput(raw);
              }}
              placeholder="0.50"
              className="w-24 rounded-md border border-gray-200 bg-white px-2 py-1 text-[14px] outline-none"
            />
            <span className="text-[14px]">%</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-2 text-[14px]" onClick={()=>setOpen(false)}>Cancel</button>
            <button
              type="button"
              className="w-1/2 rounded-[14px] bg-[#2200FF] px-4 py-2 text-[14px] text-white"
              onClick={() => {
                const n = parseFloat(input || "0");
                if (Number.isFinite(n)) onChange(Math.max(0, Math.min(50, n)));
                setOpen(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

