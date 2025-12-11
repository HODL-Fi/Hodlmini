"use client";

import React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import HealthBar from "@/components/HeathBar";
import Modal from "@/components/ui/Modal";
import { CustomInput } from "@/components/inputs";
import { VaultIcon } from "@customIcons";
import GlobalAccountsScroller from "@/components/accounts/GlobalAccountsScroller";
import { VisibilityProvider } from "@/components/visibility";
import BorrowTopNav from "@/components/BorrowTopNav";
import { QuickActions } from "@/components/quickActions";
import BalanceRow from "@/components/BalanceRow";
import useGetHealthFactor from "@/hooks/vault/useGetHealthFactor";
import useGetCollateralPosition from "@/hooks/vault/useGetCollateralPosition";
import useGetAccountValue from "@/hooks/vault/useGetAccountValue";
import { useAuthStore } from "@/stores/useAuthStore";

type Position = { symbol: string; amount: number };

export default function VaultPage() {
  return (
    <React.Suspense fallback={<div className="min-h-dvh px-3 text-left">Loading…</div>}>
      <VaultPageInner />
    </React.Suspense>
  );
}

function VaultPageInner() {
  const searchParams = useSearchParams();
  const simEnabled = searchParams?.get("sim") === "1";
  const debtParam = parseFloat(searchParams?.get("debt") || "0");
  const hfParam = parseFloat(searchParams?.get("hf") || "");

  const assets = React.useMemo(() => ([
    { symbol: "ETH",  name: "Ethereum",      icon: "/assets/eth.svg",  priceUsd: 3500,     collateralFactor: 0.7, liquidationThreshold: 0.8 },
    { symbol: "USDT", name: "Tether",        icon: "/assets/usdt.svg", priceUsd: 1,        collateralFactor: 0.8, liquidationThreshold: 0.85 },
    { symbol: "USDC", name: "USD Coin",      icon: "/assets/usdc.svg", priceUsd: 1,        collateralFactor: 0.85,liquidationThreshold: 0.9 },
    { symbol: "BNB",  name: "BNB",           icon: "/assets/bnb.svg",  priceUsd: 600,      collateralFactor: 0.6, liquidationThreshold: 0.7 },
  ]), []);

  const [positions, setPositions] = React.useState<Position[]>(
    simEnabled ? [ { symbol: "ETH", amount: 1.25 }, { symbol: "USDT", amount: 4500 } ] : []
  );
  const initialDebt = (Number.isFinite(debtParam) && debtParam > 0) ? debtParam : (simEnabled ? 6200 : 0);
  const [debtUsd, setDebtUsd] = React.useState<number>(initialDebt);
  const [cfLtInfo, setCfLtInfo] = React.useState<{ symbol: string; cf: number; lt: number } | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState<"deposit" | "withdraw">("deposit");
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [editValue, setEditValue] = React.useState<string>("");
  const [assetPickerOpen, setAssetPickerOpen] = React.useState(false);
  const [assetPickerMode, setAssetPickerMode] = React.useState<"deposit" | "withdraw">("deposit");

  const getAsset = React.useCallback((sym: string) => assets.find(a => a.symbol === sym)!, [assets]);

  const totals = React.useMemo(() => {
    let totalValueUSD = 0, capacityUSD = 0, liqValueUSD = 0;
    positions.forEach(p => {
      const a = getAsset(p.symbol);
      if (!a || !Number.isFinite(p.amount) || p.amount <= 0) return;
      const val = p.amount * a.priceUsd;
      totalValueUSD += val;
      capacityUSD += val * (a.collateralFactor ?? 0);
      liqValueUSD += val * (a.liquidationThreshold ?? 0);
    });
    const borrowRemainUSD = Math.max(0, capacityUSD - debtUsd);
    const hf = debtUsd > 0 ? liqValueUSD / debtUsd : Infinity;
    const riskPct = !Number.isFinite(hf) ? 0 : Math.min(100, Math.round(100 / hf));
    return { totalValueUSD, capacityUSD, liqValueUSD, borrowRemainUSD, hf, riskPct };
  }, [positions, debtUsd, getAsset]);

  // Optional URL-driven HF: /vault?sim=1&hf=1.35 → adjusts debt so that hf ≈ provided
  React.useEffect(() => {
    if (Number.isFinite(hfParam) && hfParam > 0) {
      const targetDebt = totals.liqValueUSD > 0 ? totals.liqValueUSD / hfParam : 0;
      if (targetDebt > 0 && Math.abs(targetDebt - debtUsd) > 0.01) {
        setDebtUsd(Number(targetDebt.toFixed(2)));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hfParam, totals.liqValueUSD]);

  function formatNumber(n: number, d = 2) {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  }

  const healthFactor = useGetHealthFactor();
  const collateralPosition = useGetCollateralPosition();
  const accountValue = useGetAccountValue();

  // const { evmAddress } = useAuthStore.getState();
  
  // console.log("evmAddress ", evmAddress);
  
  
  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <VisibilityProvider>
        {/* Sticky top nav (like Wallet) */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          {/* <BorrowTopNav title="My Vault" subtitle={`Collateral value $${formatNumber(totals.totalValueUSD)}`} /> */}
          <BorrowTopNav title="My Vault" subtitle="Your vault across networks" />

        </div>

      {/* Accounts scroller */}
      <section className="mt-4">
        <GlobalAccountsScroller />
      </section>

      {/* Total collateral balance */}
      <section className="mt-4">
        <BalanceRow label="Total Collateral" amount={`$${formatNumber(totals.totalValueUSD)}`} />
      </section>

      {/* Quick actions: Deposit / Withdraw */}
      <section className="mt-4">
        <QuickActions
          items={React.useMemo(() => ([
            { key: "deposit", iconSrc: "/icons/plus.svg", label: "Deposit", onClick: () => {
              setAssetPickerMode("deposit");
              setAssetPickerOpen(true);
            } },
            { key: "withdraw", iconSrc: "/icons/arrow-up-right.svg", label: "Withdraw", onClick: () => {
              setAssetPickerMode("withdraw");
              setAssetPickerOpen(true);
            } },
          ]), [positions.length])}
        />
      </section>

        {/* Capacity & Health */}
        <section className="mt-3 rounded-[16px] border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between text-[14px]">
            <div className="text-gray-600">Health Factor</div>
            <div className="font-semibold">{Number.isFinite(totals.hf) ? totals.hf.toFixed(2) : "—"}</div>
          </div>
          <div className="mt-2">
            <HealthBar percentage={totals.riskPct} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[14px]">
            <div className="text-gray-600">Borrow limit remaining</div>
            <div className="text-right font-semibold">${formatNumber(totals.borrowRemainUSD)}</div>
            <div className="text-gray-600">Current debt</div>
            <div className="text-right font-semibold">${formatNumber(debtUsd)}</div>
          </div>
        </section>

        {/* Positions list */}
        <section className="mt-4 rounded-[16px] border border-gray-200 bg-white p-2">
          <div className="px-2 py-2 text-[14px] font-semibold">Collateral positions</div>
          <div className="divide-y divide-gray-100">
            {positions.length === 0 && (
              <div className="px-2 py-6 text-center text-[14px] text-gray-600">No collateral yet. Deposit assets to start borrowing.</div>
            )}
            {positions.map((p, idx) => {
              const a = getAsset(p.symbol);
              const val = p.amount * a.priceUsd;
              return (
                <div key={`${p.symbol}-${idx}`} className="flex items-center justify-between px-2 py-3">
                  <div className="flex items-center gap-3">
                    <Image src={a.icon} alt={a.symbol} width={28} height={28} />
                    <div>
                      <div className="text-[14px] font-medium">{p.amount} {a.symbol}</div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-600">
                        <span>${formatNumber(val)} · CF {Math.round((a.collateralFactor ?? 0)*100)}% · LT {Math.round((a.liquidationThreshold ?? 0)*100)}%</span>
                        <button
                          type="button"
                          aria-label="What are CF and LT?"
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                          onClick={() => setCfLtInfo({ symbol: a.symbol, cf: a.collateralFactor ?? 0, lt: a.liquidationThreshold ?? 0 })}
                        >
                          <Image src="/icons/info.svg" alt="Info" width={16} height={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <button
                      className="rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium cursor-pointer"
                      onClick={() => { setEditMode("deposit"); setEditIndex(idx); setEditValue(""); setEditOpen(true); }}
                    >
                      Deposit
                    </button>
                    <button
                      className="rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium cursor-pointer"
                      onClick={() => { setEditMode("withdraw"); setEditIndex(idx); setEditValue(""); setEditOpen(true); }}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        </VisibilityProvider>
      </main>
      {/* Deposit / Withdraw modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        {editIndex !== null && positions[editIndex] && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-[18px] font-semibold">{editMode === "deposit" ? "Deposit" : "Withdraw"}</div>
              <button type="button" aria-label="Close" onClick={() => setEditOpen(false)} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            {(() => {
              const pos = positions[editIndex!];
              if (!pos) {
                return (
                  <div className="text-[14px] text-gray-600">Preparing editor…</div>
                );
              }
              const a = getAsset(pos.symbol);
              const numeric = parseFloat((editValue || "0").replace(/,/g, ""));
              const isNumber = Number.isFinite(numeric) && numeric > 0;
              const canConfirm = isNumber && (editMode === "deposit" || numeric <= pos.amount);
              const maxWithdraw = pos.amount;
              return (
                <>
                  <CustomInput
                    value={editValue}
                    onChange={setEditValue}
                    tokenLabel={a.symbol}
                    tokenIconSrc={a.icon}
                    onDropdownClick={() => {}}
                  />
                  <div className="mt-1 flex items-center justify-between text-[12px] text-gray-600">
                    {editMode === "withdraw" ? (
                      <div>Available in vault: <span className="font-medium">{pos.amount}</span> {a.symbol}</div>
                    ) : (
                      <div>Wallet balance: <span className="font-medium">—</span></div>
                    )}
                    {editMode === "withdraw" && (
                      <button type="button" className="text-[#2200FF] cursor-pointer" onClick={() => setEditValue(String(maxWithdraw))}>Max</button>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer" onClick={() => setEditOpen(false)}>Cancel</button>
                    <button
                      type="button"
                      disabled={!canConfirm}
                      className={`w-1/2 rounded-[14px] px-4 py-3 text-[14px] font-medium text-white ${canConfirm ? "bg-[#2200FF] cursor-pointer" : "bg-gray-300 cursor-not-allowed"}`}
                      onClick={() => {
                        if (!canConfirm) return;
                        const v = numeric;
                        setPositions(prev => prev.map((q,i) => {
                          if (i !== editIndex) return q;
                          const nextAmt = editMode === "deposit" ? q.amount + v : Math.max(0, q.amount - v);
                          return { ...q, amount: Number(nextAmt.toFixed(6)) };
                        }));
                        setEditOpen(false);
                      }}
                    >
                      {editMode === "deposit" ? "Deposit" : "Withdraw"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Asset picker for Quick Actions */}
      <Modal open={assetPickerOpen} onClose={() => setAssetPickerOpen(false)}>
        <div className="space-y-3">
          <div className="text-[18px] font-semibold">{assetPickerMode === "deposit" ? "Select asset to deposit" : "Select asset to withdraw"}</div>
          <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
            {assetPickerMode === "deposit" ? (
              assets.map((a) => (
                <button
                  key={a.symbol}
                  type="button"
                  onClick={() => {
                    const existingIndex = positions.findIndex(p => p.symbol === a.symbol);
                    setAssetPickerOpen(false);
                    if (existingIndex !== -1) {
                      setEditMode("deposit");
                      setEditIndex(existingIndex);
                      setEditValue("");
                      setEditOpen(true);
                    } else {
                      const nextIndex = positions.length;
                      setPositions(prev => [...prev, { symbol: a.symbol, amount: 0 }]);
                      // Open the modal after the position is added
                      setTimeout(() => {
                        setEditMode("deposit");
                        setEditIndex(nextIndex);
                        setEditValue("");
                        setEditOpen(true);
                      }, 0);
                    }
                  }}
                  className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50"
                >
                  <Image src={a.icon} alt={a.symbol} width={24} height={24} />
                  <div className="flex-1 text-[14px] font-medium">{a.name} ({a.symbol})</div>
                </button>
              ))
            ) : (
              positions.map((p, i) => {
                const a = assets.find(x => x.symbol === p.symbol)!;
                const disabled = !p.amount || p.amount <= 0;
                return (
                  <button
                    key={`${p.symbol}-${i}`}
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      setAssetPickerOpen(false);
                      setEditMode("withdraw");
                      setEditIndex(i);
                      setEditValue("");
                      setEditOpen(true);
                    }}
                    aria-disabled={disabled}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 cursor-pointer"}`}
                  >
                    <Image src={a.icon} alt={a.symbol} width={24} height={24} />
                    <div className="flex-1 text-[14px] font-medium">{a.name} ({a.symbol})</div>
                    <div className="text-[12px]">{p.amount}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </Modal>
      {/* CF / LT info modal */}
      <Modal open={!!cfLtInfo} onClose={() => setCfLtInfo(null)}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="text-[18px] font-semibold">About collateral & liquidation</div>
            <button type="button" aria-label="Close" onClick={() => setCfLtInfo(null)} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          {cfLtInfo && (
            <div className="space-y-2 text-[14px] text-gray-700">
              <div className="text-[14px] text-gray-900 font-semibold">{cfLtInfo.symbol}</div>
              <div>
                <span className="font-medium">Collateral Factor (CF):</span> Up to {Math.round(cfLtInfo.cf * 100)}% of the asset’s USD value contributes to your borrow limit.
              </div>
              <div>
                <span className="font-medium">Liquidation Threshold (LT):</span> If your Health Factor falls to 1.0, positions may be liquidated at about {Math.round(cfLtInfo.lt * 100)}% of the asset’s value.
              </div>
              <div className="rounded-md bg-[#FFF7D6] p-3 text-[13px] text-gray-700">
                Tip: Higher CF increases borrowing power. Higher LT increases liquidation sensitivity. Keep Health Factor comfortably above 1.2.
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}


