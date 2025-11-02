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

export default function SendPage() {
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

  const [assetOpen, setAssetOpen] = React.useState(false);
  const [chainOpen, setChainOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState(ASSETS[0]);
  const [selectedChain, setSelectedChain] = React.useState(CHAINS[0]);
  const [amount, setAmount] = React.useState("");
  const [toAddress, setToAddress] = React.useState("");

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [processingOpen, setProcessingOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [failedOpen, setFailedOpen] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const canSend = Boolean(amount) && Boolean(toAddress);

  return (
    <div className="min-h-dvh">
      <main className="px-2 py-4 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Send" subtitle="Transfer assets to another address" />
        </div>

        <section className="mt-4 space-y-4">
          <div>
            <div className="text-[14px] text-gray-600">Asset</div>
            <button type="button" className="mt-1 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-white px-3 py-3 cursor-pointer" onClick={() => setAssetOpen(true)}>
              <div className="flex items-center gap-2"><Image src={selectedAsset.icon} alt={selectedAsset.symbol} width={20} height={20} /><span className="text-[14px] font-medium">{selectedAsset.name}</span></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          <div>
            <div className="text-[14px] text-gray-600">Network</div>
            <button type="button" className="mt-1 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-white px-3 py-3 cursor-pointer" onClick={() => setChainOpen(true)}>
              <div className="flex items-center gap-2"><Image src={selectedChain.icon} alt={selectedChain.name} width={20} height={20} /><span className="text-[14px] font-medium">{selectedChain.name}</span></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          <div>
            <div className="text-[14px] text-gray-600">To</div>
            <input value={toAddress} onChange={(e)=>setToAddress(e.target.value)} placeholder="0x... recipient" className="mt-1 w-full rounded-[14px] border border-gray-200 bg-white px-3 py-3 text-[14px] outline-none" />
          </div>
          <div>
            <div className="text-[14px] text-gray-600">Amount</div>
            <CustomInput value={amount} onChange={setAmount} tokenLabel={selectedAsset.symbol} tokenIconSrc={selectedAsset.icon} onDropdownClick={()=>setAssetOpen(true)} />
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)] z-10">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button type="button" disabled={!canSend} className={`w-full rounded-[20px] px-4 py-3 text-[14px] font-medium text-center ${canSend ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`} onClick={()=>setConfirmOpen(true)}>Send</button>
          </div>
        </div>

        {/* Asset modal */}
        <Modal open={assetOpen} onClose={()=>setAssetOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select asset</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {ASSETS.map((a)=> (
                <button key={a.symbol} type="button" onClick={()=>{ setSelectedAsset(a); setAssetOpen(false); }} className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50">
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
          title="Confirm send"
          rows={[
            { label: "Asset", value: `${selectedAsset.symbol}` },
            { label: "Network", value: selectedChain.name },
            { label: "To", value: toAddress || "—" },
            { label: "Amount", value: `${amount || "0"} ${selectedAsset.symbol}` },
            { label: "Fee", value: "$0.00" },
          ]}
          confirmLabel="Send now"
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
        <ProcessingModal open={processingOpen} onClose={()=>setProcessingOpen(false)} title="Processing send" progress={progress} />
        <TxSuccessModal open={successOpen} onClose={()=>setSuccessOpen(false)} onViewReceipt={()=>setSuccessOpen(false)} />
        <TxFailedModal open={failedOpen} onClose={()=>setFailedOpen(false)} onRetry={()=>{ setFailedOpen(false); setConfirmOpen(true); }} />
      </main>
    </div>
  );
}


