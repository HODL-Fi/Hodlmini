"use client";

import React from "react";
import { VisibilityProvider } from "@/components/visibility";
import BorrowTopNav from "@/components/BorrowTopNav";
import { AccountsScroller } from "@/components/accounts";
import GlobalAccountsScroller from "@/components/accounts/GlobalAccountsScroller";
import BalanceRow from "@/components/BalanceRow";
import { QuickActions } from "@/components/quickActions";
import { WalletIcon, VaultIcon } from "@customIcons";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

export default function WalletPage() {
  // Supported chains and assets
  const CHAINS = React.useMemo(() => ([
    { key: "ALL", name: "All networks", icon: "/icons/globe-alt.svg" },
    { key: "ETH", name: "Ethereum", icon: "/chains/ethereum.svg" },
    { key: "BSC", name: "BNB Smart Chain", icon: "/chains/bsc.svg" },
    { key: "LSK", name: "Lisk", icon: "/chains/lisk.svg" },
    { key: "BASE", name: "Base", icon: "/chains/base.svg" },
  ]), []);

  type ChainKey = "ALL" | "ETH" | "BSC" | "LSK" | "BASE";
  type AssetItem = {
    symbol: string;
    name: string;
    icon: string;
    supported: ChainKey[]; // chains where asset is available
    balances: Partial<Record<ChainKey, number>>; // per-network amounts
    price: number; // usd
    changePct: number; // 24h %
  };

  const ASSETS: AssetItem[] = React.useMemo(() => ([
    { symbol: "ETH",  name: "Ethereum",  icon: "/assets/eth.svg",  supported: ["ETH","BSC","LSK","BASE"], balances: { ETH: 1.12 },  price: 3115.25, changePct: 1.12 },
    { symbol: "USDT", name: "Tether",    icon: "/assets/usdt.svg", supported: ["ETH","BSC","LSK","BASE"], balances: { ETH: 1109, BSC: 1000 },   price: 1.00,     changePct: -0.29 },
    { symbol: "USDC", name: "USD Coin",  icon: "/assets/usdc.svg", supported: ["ETH","BSC","LSK","BASE"], balances: { ETH: 119.87 }, price: 1.00,     changePct: 1.12 },
    { symbol: "DAI",  name: "DAI",       icon: "/assets/dai.svg",  supported: ["ETH","BSC","LSK","BASE"], balances: { },      price: 1.00,     changePct: 0.05 },
    { symbol: "WETH", name: "Wrapped ETH", icon: "/assets/weth.svg", supported: ["ETH","BSC","LSK","BASE"], balances: { },   price: 3115.25, changePct: 1.10 },
    { symbol: "BNB",  name: "BNB",       icon: "/assets/bnb.svg",  supported: ["ETH","BSC","LSK","BASE"], balances: { },      price: 600.00,  changePct: 0.84 },
    { symbol: "WKC",  name: "Wikicat",   icon: "/assets/wkc.svg",  supported: ["BSC"],                         balances: { BSC: 0 },      price: 0.000001, changePct: -3.2 },
    { symbol: "cNGN", name: "compliant NGN", icon: "/assets/cngn.svg", supported: ["BASE","ETH","BSC"], balances: { BASE: 0 }, price: 1/1500, changePct: 0.0 },
  ]), []);

  const [selectedChain, setSelectedChain] = React.useState<ChainKey>("ALL");
  const [networkModalOpen, setNetworkModalOpen] = React.useState(false);

  const filteredAssets = React.useMemo(() => {
    // Build display rows with aggregated or per-network balances
    return ASSETS.map(a => {
      const amount = selectedChain === "ALL"
        ? sumChains(a.balances)
        : (a.balances[selectedChain] ?? 0);
      return { ...a, displayAmount: amount } as AssetItem & { displayAmount: number };
    })
    .filter(row => row.displayAmount > 0)
    .sort((l,r) => (r.displayAmount * r.price) - (l.displayAmount * l.price));
  }, [ASSETS, selectedChain]);

  const CHAIN_PRIORITY: ChainKey[] = React.useMemo(() => ["ETH","BSC","LSK","BASE"], []);
  function pickBadgeChain(supported: ChainKey[], selected: ChainKey): ChainKey | null {
    if (selected !== "ALL" && supported.includes(selected)) return selected;
    for (const c of CHAIN_PRIORITY) if (supported.includes(c)) return c;
    return supported[0] ?? null;
  }

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <VisibilityProvider>
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <BorrowTopNav title="Wallet" subtitle="Manage multiple wallets in one place" />
          </div>

          <section className="mt-4">
            <GlobalAccountsScroller />
          </section>

          <section className="mt-6">
            <BalanceRow label="Main balance" amount="$22,199.09" />
          </section>

          <section className="mt-6">
            <QuickActions
              items={React.useMemo(() => ([
                { key: "receive", iconSrc: "/icons/arrow-down-left.svg", label: "Receive", href: "/wallet/receive" },
                { key: "swap",    iconSrc: "/icons/swap.svg",             label: "Swap",    href: "/wallet/swap" },
                { key: "send",    iconSrc: "/icons/arrow-up-right.svg",   label: "Send",    href: "/wallet/send" },
                { key: "history", iconSrc: "/icons/Vector (Stroke).svg",  label: "History", href: "/wallet/history" },
              ]), [])}
            />
          </section>

          {/* Assets list */}
          <section className="mt-6">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-[14px] font-medium cursor-pointer"
                onClick={() => setNetworkModalOpen(true)}
              >
                <Image src={CHAINS.find(c=>c.key===selectedChain)?.icon || "/icons/globe-alt.svg"} alt="chain" width={16} height={16} />
                {CHAINS.find(c=>c.key===selectedChain)?.name || "All networks"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <button type="button" className="rounded-full p-2 hover:bg-gray-100 cursor-pointer" aria-label="Filter">
                <Image src="/icons/filter.svg" alt="Filter" width={20} height={20} />
              </button>
            </div>

            <div className="mt-3 divide-y divide-gray-100 rounded-2xl bg-white">
              {filteredAssets.map((a, idx) => {
                const usd = (a as any).displayAmount * a.price;
                const positive = a.changePct >= 0;
                const badgeKey = pickBadgeChain(a.supported, selectedChain);
                const chainChip = CHAINS.find(c => c.key === badgeKey);
                return (
                  <div key={`${a.symbol}-${idx}`} className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Image src={a.icon} alt={a.symbol} width={48} height={48} />
                        {chainChip && chainChip.icon && (
                          <div className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 shadow">
                            <Image src={chainChip.icon} alt={chainChip.name} width={16} height={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[16px] font-semibold">{a.name}</div>
                        <div className="text-[12px] text-gray-600">{formatAmount((a as any).displayAmount)} {a.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[16px] font-semibold">{formatUsd(usd)}</div>
                      <div className={`text-[12px] ${positive ? "text-emerald-600" : "text-red-500"}`}>{(positive?"+":"") + a.changePct.toFixed(2)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <NetworkSelectModal
            open={networkModalOpen}
            onClose={() => setNetworkModalOpen(false)}
            chains={CHAINS}
            selected={selectedChain}
            onSelect={(k) => { setSelectedChain(k as ChainKey); setNetworkModalOpen(false); }}
          />
        </VisibilityProvider>
      </main>
    </div>
  );
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(n);
}

function formatUsd(n: number) {
  return `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

function sumChains(rec: Partial<Record<string, number>>): number {
  let t = 0;
  for (const k in rec) {
    const v = (rec as any)[k];
    if (Number.isFinite(v) && v > 0) t += v as number;
  }
  return t;
}

function NetworkSelectModal({ open, onClose, chains, selected, onSelect }: {
  open: boolean;
  onClose: () => void;
  chains: Array<{ key: string; name: string; icon: string }>;
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="text-[18px] font-semibold">Select network</div>
        <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
          {chains.map((c) => (
            <button key={c.key} type="button" onClick={() => onSelect(c.key)} className={`flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50 ${selected === c.key ? "bg-gray-50" : ""}`}>
              {c.icon ? <Image src={c.icon} alt={c.name} width={24} height={24} /> : <div className="h-6 w-6" />}
              <div className="flex-1 text-[14px]">{c.name}</div>
              {selected === c.key && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

 
