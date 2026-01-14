"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import { useAuthStore } from "@/stores/useAuthStore";
import QRCode from "react-qr-code";
import { CHAIN_IDS } from "@/utils/constants/chainIds";

export default function ReceivePage() {
  const qrContainerRef = React.useRef<HTMLDivElement | null>(null);

  const CHAINS = React.useMemo(() => {
    const allChains = [
      { key: "ETH", name: "Ethereum", icon: "/chains/ethereum.svg" },
      { key: "BSC", name: "BNB Smart Chain", icon: "/chains/bsc.svg" },
      { key: "LSK", name: "Lisk", icon: "/chains/lisk.svg" },
      { key: "BASE", name: "Base", icon: "/chains/base.svg" },
      { key: "MANTLE", name: "Mantle", icon: "/chains/mantle.svg" },
      { key: "TEST", name: "Test Network", icon: "/chains/test.svg" },
    ];

    // Only show networks that exist in CHAIN_IDS for this environment
    return allChains.filter((chain) => chain.key in CHAIN_IDS);
  }, []);

  const [chainOpen, setChainOpen] = React.useState(false);
  const [selectedChain, setSelectedChain] = React.useState(CHAINS[0]);
  const evmAddress = useAuthStore((s) => s.evmAddress);
  const address = React.useMemo(() => {
    // Prefer user's EVM address for EVM-compatible networks
    const evmChains = new Set(["ETH", "BSC", "BASE", "MANTLE", "TEST"]);
    if (evmChains.has(selectedChain.key) && evmAddress) {
      return evmAddress;
    }
    // Fallback demo addresses (only used when no wallet is connected)
    const map: Record<string, string> = {
      ETH: "0x5A1b2C3D4E5F6A7B8C9D00112233445566778899",
      BSC: "0xBEEfBEEF00001111222233334444555566667777",
      LSK: "0x1111222233334444555566667777888899990000",
      BASE: "0xABCDEFabcdefABCDEFabcdefABCDEFabcdef1234",
      MANTLE: "0xABCDEFabcdefABCDEFabcdefABCDEFabcdef1234",
      TEST: "0x0000000000000000000000000000000000000000",
    };
    return map[selectedChain.key] || map.ETH;
  }, [selectedChain, evmAddress]);
  const [hint, setHint] = React.useState<string | null>(null);
  const copy = async (txt: string) => {
    try { await navigator.clipboard?.writeText(txt); setHint("Address copied"); setTimeout(()=>setHint(null), 1200); } catch {}
  };


  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Receive" subtitle="Deposit assets into your wallet" showBack />
        </div>

        <section className="mt-4 space-y-4">
          <div>
            <div className="text-[14px] text-gray-600">Network</div>
            <button type="button" className="mt-1 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-white px-3 py-3 cursor-pointer" onClick={() => setChainOpen(true)}>
              <div className="flex items-center gap-2"><Image src={selectedChain.icon} alt={selectedChain.name} width={20} height={20} /><span className="text-[14px] font-medium">{selectedChain.name}</span></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          <div className="rounded-[16px] border border-gray-200 bg-white p-4 text-center">
            <div className="mx-auto mb-3 h-40 w-40 overflow-hidden rounded-xl bg-white grid place-items-center" ref={qrContainerRef}>
              <div style={{ background: 'white', padding: 8, borderRadius: 12 }} aria-hidden>
                <QRCode value={address} size={160} level="M" />
              </div>
            </div>
            <div className="text-[14px] font-mono break-all">{address}</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[12px] hover:bg-[#2200FF] hover:text-white"
                onClick={() => copy(address)}
              >
                <Image src="/icons/copy.svg" alt="Copy" width={14} height={14} />
                <span>Copy address</span>
              </button>
            </div>
            {hint && <div className="mt-2 text-[12px] text-gray-600">{hint}</div>}
          </div>
        </section>

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

      </main>
    </div>
  );
}


