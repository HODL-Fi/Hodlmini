"use client";

import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import BorrowTopNav from "@/components/BorrowTopNav";
import { CustomInput } from "@/components/inputs";
import Modal from "@/components/ui/Modal";
import BorrowSummary from "@/components/borrow/BorrowSummary";
import BorrowConfirmingModal from "@/components/borrow/BorrowConfirmingModal";
import BorrowSuccessModal from "@/components/borrow/BorrowSuccessModal";
import BorrowFailedModal from "@/components/borrow/BorrowFailedModal";
import BankSelectModal, { type BankAccount } from "@/components/borrow/BankSelectModal";
import HealthBar from "@/components/HeathBar";

export default function BorrowPage() {
  return (
    <React.Suspense fallback={<div className="min-h-dvh px-3 text-left">Loading…</div>}>
      <BorrowPageInner />
    </React.Suspense>
  );
}

function BorrowPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const modeParam = searchParams?.get("mode") ?? undefined; // existing | new
  const isExistingMode = modeParam === "existing";
  const borrowResultParam = (searchParams?.get("borrowResult") ?? "success").toLowerCase(); // success|fail
  const simEnabled = searchParams?.get("sim") === "1";
  const assets = React.useMemo(() => ([
    // Defaults for demo; can be tuned per asset
    { symbol: "ETH",  name: "Ethereum",      icon: "/assets/eth.svg",  priceUsd: 3500,     balance: 4.0,  collateralFactor: 0.7, liquidationThreshold: 0.8 },
    { symbol: "WETH", name: "Wrapped ETH",   icon: "/assets/weth.svg", priceUsd: 3500,     balance: 0,    collateralFactor: 0.7, liquidationThreshold: 0.8 },
    { symbol: "DAI",  name: "DAI",           icon: "/assets/dai.svg",  priceUsd: 1,        balance: 0,    collateralFactor: 0.8, liquidationThreshold: 0.85 },
    { symbol: "cNGN", name: "compliant NGN", icon: "/assets/cngn.svg", priceUsd: 1/1500,   balance: 0,    collateralFactor: 0.6, liquidationThreshold: 0.7 },
    { symbol: "WKC",  name: "Wikicat",       icon: "/assets/wkc.svg",  priceUsd: 0.000001, balance: 0,    collateralFactor: 0.2, liquidationThreshold: 0.3 },
    { symbol: "USDT", name: "Tether",        icon: "/assets/usdt.svg", priceUsd: 1,        balance: 12000,collateralFactor: 0.8, liquidationThreshold: 0.85 },
    { symbol: "USDC", name: "USD Coin",      icon: "/assets/usdc.svg", priceUsd: 1,        balance: 8800, collateralFactor: 0.85,liquidationThreshold: 0.9 },
    { symbol: "BNB",  name: "BNB",           icon: "/assets/bnb.svg",  priceUsd: 600,      balance: 9.3,  collateralFactor: 0.6, liquidationThreshold: 0.7 },
  ]), []);
  const fiats = React.useMemo(() => ([
    { code: "NGN", name: "Nigerian Naira", icon: "/fiat/ngn.svg", usdToFiat: 1500 },
    { code: "GHC", name: "Ghanian Cedi", icon: "/fiat/ghs.svg", usdToFiat: 15 },
    { code: "KHS", name: "Kenyan Shillings", icon: "/fiat/khs.svg", usdToFiat: 130 },
    { code: "ZAR", name: "South African Rand", icon: "/fiat/zar.svg", usdToFiat: 18 },
  ]), []);

  const [collateralLines, setCollateralLines] = React.useState<{ symbol: string; amount: string }[]>([
    { symbol: assets[0].symbol, amount: "" },
  ]);
  const [selectedFiat, setSelectedFiat] = React.useState(fiats[0]);
  const [fiatReceive, setFiatReceive] = React.useState("");
  const [assetModalOpen, setAssetModalOpen] = React.useState(false);
  const [assetRowIndex, setAssetRowIndex] = React.useState<number | null>(null);
  const [fiatModalOpen, setFiatModalOpen] = React.useState(false);
  const [ltvInfoOpen, setLtvInfoOpen] = React.useState(false);
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const [confirmingOpen, setConfirmingOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [failedOpen, setFailedOpen] = React.useState(false);
  const [confirmProgress, setConfirmProgress] = React.useState(0);
  const [bankOpen, setBankOpen] = React.useState(false);
  const bankAccounts = React.useMemo<BankAccount[]>(() => ([
    { id: "uba-1", name: "Zeebriya Jasper", number: "0123498765", bank: "United Bank for Africa", logo: "/banks/uba.svg" },
    { id: "fbn-2", name: "Zeebriya Jasper Hernandes", number: "0123498765", bank: "First Bank", logo: "/banks/fbn.svg" },
    { id: "rvn-3", name: "Zeebriya Jasper", number: "3498760125", bank: "Raven Bank", logo: "/banks/bank.svg" },
  ]), []);
  const [selectedBankId, setSelectedBankId] = React.useState<string | null>(bankAccounts[0]?.id ?? null);
  const [collateralExpanded, setCollateralExpanded] = React.useState(true);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = React.useState(false);
  const [showBottomShadow, setShowBottomShadow] = React.useState(false);

  // Simulated existing portfolio positions when using URL flag sim=1
  const existingPositions = React.useMemo(() => {
    if (!simEnabled) return [] as { symbol: string; amount: number }[];
    return [
      { symbol: "ETH", amount: 1.25 },
      { symbol: "USDT", amount: 4500 },
    ];
  }, [simEnabled]);

  // Tenure & rates
  const TENURES = React.useMemo(() => [7, 30, 60, 90, 365], []);
  const [tenureDays, setTenureDays] = React.useState<number>(30);
  const BASE_DAILY_RATE = 0.0005; // 0.05% per day
  const OVERDUE_DAILY_RATE = 0.00025; // 0.025% per day after tenure

  const LTV = 0.7;

  function formatNumber(n: number, fractionDigits = 2) {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(n);
  }

  function formatFiat(code: string, amount: number) {
    // Simple symbol mapping; extend as needed
    const symbols: Record<string, string> = { NGN: "₦", ZAR: "R", GHC: "₵", KHS: "KSh" };
    const prefix = symbols[code] ?? "";
    return `${prefix}${formatNumber(amount)}`;
  }

  function computeLtvUsagePercent(valueStr: string, maxFiat: number) {
    const v = parseFloat((valueStr || "0").replace(/,/g, ""));
    if (!isFinite(v) || v <= 0 || maxFiat <= 0) return 0;
    return Math.max(0, Math.min(100, (v / maxFiat) * 100));
  }

  function handleMaxCollateral(rowIndex: number) {
    setCollateralLines((prev) => {
      const next = [...prev];
      const asset = assets.find((a) => a.symbol === next[rowIndex].symbol)!;
      next[rowIndex] = { ...next[rowIndex], amount: String(asset.balance) };
      return next;
    });
  }

  function handleMaxReceive() {
    const maxUsd = isExistingMode
      ? existingPositions.reduce((sum, pos) => {
          const asset = assets.find((a) => a.symbol === pos.symbol);
          if (!asset || !isFinite(pos.amount) || pos.amount <= 0) return sum;
          return sum + pos.amount * asset.priceUsd * (asset.collateralFactor ?? LTV);
        }, 0)
      : collateralLines.reduce((sum, line) => {
          const asset = assets.find((a) => a.symbol === line.symbol);
          const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
          if (!asset || !isFinite(amt) || amt <= 0) return sum;
          return sum + amt * asset.priceUsd * (asset.collateralFactor ?? LTV);
        }, 0);
    const maxFiat = maxUsd * selectedFiat.usdToFiat;
    setFiatReceive(maxFiat > 0 ? formatNumber(maxFiat) : "");
  }

  // keep receive independent; no auto-overwrite on collateral/asset/fiat changes

  const maxLendForCollateral = React.useMemo(() => {
    const totalUsdCapacity = isExistingMode
      ? existingPositions.reduce((sum, pos) => {
          const asset = assets.find((a) => a.symbol === pos.symbol);
          if (!asset || !isFinite(pos.amount) || pos.amount <= 0) return sum;
          return sum + pos.amount * asset.priceUsd * (asset.collateralFactor ?? LTV);
        }, 0)
      : collateralLines.reduce((sum, line) => {
          const asset = assets.find((a) => a.symbol === line.symbol);
          const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
          if (!asset || !isFinite(amt) || amt <= 0) return sum;
          return sum + amt * asset.priceUsd * (asset.collateralFactor ?? LTV);
        }, 0);
    return totalUsdCapacity * selectedFiat.usdToFiat;
  }, [collateralLines, assets, selectedFiat, isExistingMode, existingPositions]);

  const receiveNumeric = React.useMemo(() => parseFloat((fiatReceive || "").replace(/,/g, "")), [fiatReceive]);
  const hasReceive = Number.isFinite(receiveNumeric) && receiveNumeric > 0;
  const totalCollateralAmount = React.useMemo(() => {
    if (isExistingMode) {
      return existingPositions.reduce((sum, pos) => sum + (isFinite(pos.amount) ? pos.amount : 0), 0);
    }
    return collateralLines.reduce((sum, line) => {
      const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
      if (!isFinite(amt) || amt <= 0) return sum;
      return sum + amt;
    }, 0);
  }, [collateralLines, isExistingMode, existingPositions]);
  const hasCollateral = Number.isFinite(totalCollateralAmount) && totalCollateralAmount > 0;
  const isOverMax = hasReceive && maxLendForCollateral > 0 && receiveNumeric > maxLendForCollateral;
  const canBorrow = hasCollateral && hasReceive && !isOverMax;

  // Rate derived from tenure (simple interest)
  const tenureRatePercent = React.useMemo(() => tenureDays * BASE_DAILY_RATE * 100, [tenureDays]);
  const interestForTenure = React.useMemo(() => (hasReceive ? receiveNumeric * BASE_DAILY_RATE * tenureDays : 0), [hasReceive, receiveNumeric, tenureDays]);
  const totalRepayForTenure = React.useMemo(() => (hasReceive ? receiveNumeric + interestForTenure : 0), [hasReceive, receiveNumeric, interestForTenure]);
  const overduePerDayAmount = React.useMemo(() => (hasReceive ? receiveNumeric * OVERDUE_DAILY_RATE : 0), [hasReceive, receiveNumeric]);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => {
      setShowTopShadow(el.scrollTop > 0);
      setShowBottomShadow(el.scrollTop + el.clientHeight < el.scrollHeight);
    };
    update();
    el.addEventListener("scroll", update, { passive: true } as AddEventListenerOptions);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update as EventListener);
      ro.disconnect();
    };
  }, [collateralExpanded]);

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
          <BorrowTopNav />
        </div>
        <section className="mt-4 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[18px] font-semibold">I want to Collateralize</div>
              <button
                type="button"
                onClick={() => setCollateralExpanded((v) => !v)}
                className="inline-flex items-center gap-1 rounded-[10px] border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-700 cursor-pointer hover:bg-gray-50"
              >
                {collateralExpanded ? (
                  <>
                    <span>Collapse</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </>
                )}
              </button>
            </div>

            {/* Existing portfolio summary (URL-driven sim) */}
            {isExistingMode && (
              <div className="mt-2 rounded-[16px] border border-gray-200 bg-white p-3">
                <div className="text-[14px] text-gray-600">Collateral source</div>
                <div className="mt-1 text-[14px] font-semibold text-gray-900">Existing portfolio</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {existingPositions.map((pos, idx) => {
                    const asset = assets.find((a) => a.symbol === pos.symbol);
                    if (!asset) return null;
                    return (
                      <div key={`${pos.symbol}-${idx}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-800">
                        <Image src={asset.icon} alt={asset.symbol} width={16} height={16} />
                        <span className="font-medium">{asset.symbol}</span>
                        <span>{formatNumber(pos.amount, 4)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-[13px] text-[#2200FF] underline underline-offset-4 cursor-pointer"
                    onClick={() => {
                      router.push("/vault?sim=1");
                    }}
                  >
                    Manage collateral
                  </button>
                </div>
              </div>
            )}

            {!isExistingMode && !collateralExpanded && (
              <div className="mt-2 flex items-center gap-2 overflow-x-auto">
                {collateralLines.map((line, idx) => {
                  const asset = assets.find((a) => a.symbol === line.symbol)!;
                  const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
                  return (
                    <div key={`${line.symbol}-${idx}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-800">
                      <Image src={asset.icon} alt={asset.symbol} width={16} height={16} />
                      <span className="font-medium">{asset.symbol}</span>
                      <span>{Number.isFinite(amt) && amt > 0 ? amt : 0}</span>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCollateralExpanded(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-800 cursor-pointer hover:bg-gray-50"
                >
                  <Image src="/icons/plus.svg" alt="Add" width={14} height={14} />
                  Manage
                </button>
              </div>
            )}

            {!isExistingMode && collateralExpanded && (<>
              <div className="relative">
                <div ref={listRef} className="mt-2 space-y-4 max-h-[160px] overflow-y-auto pr-1">
                {collateralLines.map((line, idx) => {
                const asset = assets.find((a) => a.symbol === line.symbol)!;
                const balanceUsd = asset.balance * asset.priceUsd;
                return (
                  <div key={`${line.symbol}-${idx}`}>
                    <CustomInput
                      value={line.amount}
                      onChange={(v) => {
                        setCollateralLines((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], amount: v };
                          return next;
                        });
                      }}
                      tokenLabel={asset.symbol}
                      tokenIconSrc={asset.icon}
                      onDropdownClick={() => { setAssetRowIndex(idx); setAssetModalOpen(true); }}
                    />
                    <div className="mt-2 flex items-center justify-between text-[14px] text-gray-500">
                      <div>
                        Balance: {formatNumber(asset.balance, 2)} {asset.symbol}
                        <span className="ml-2">≈ ${formatNumber(balanceUsd, 2)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {collateralLines.length > 1 && (
                          <button type="button" className="text-red-500 cursor-pointer" onClick={() => {
                            setCollateralLines((prev) => prev.filter((_, i) => i !== idx));
                          }}>Remove</button>
                        )}
                        <button type="button" className="text-[#2200FF] cursor-pointer" onClick={() => handleMaxCollateral(idx)}>Max</button>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
                {showTopShadow && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white to-transparent" />
                )}
                {showBottomShadow && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const used = new Set(collateralLines.map((l) => l.symbol));
                    const nextAsset = assets.find((a) => !used.has(a.symbol));
                    if (!nextAsset) return; // all used
                    setCollateralLines((prev) => [...prev, { symbol: nextAsset.symbol, amount: "" }]);
                  }}
                  disabled={assets.every((a) => collateralLines.some((l) => l.symbol === a.symbol))}
                  className={`inline-flex items-center gap-2 rounded-[12px] border px-3 py-2 text-[14px] font-medium ${assets.every((a) => collateralLines.some((l) => l.symbol === a.symbol)) ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" : "border-gray-200 bg-white text-gray-800 cursor-pointer hover:bg-gray-50"}`}
                >
                  <Image src="/icons/plus.svg" alt="Add" width={18} height={18} />
                  Add collateral
                </button>
              </div>
            </>)}
          </div>

          <div>
            <div className="text-[18px] font-semibold">To receive</div>
            <div className="mt-2">
              <CustomInput
                value={fiatReceive}
                onChange={(v) => { setFiatReceive(v); }}
                tokenLabel={selectedFiat.code}
                tokenIconSrc={selectedFiat.icon}
                onDropdownClick={() => setFiatModalOpen(true)}
                invalid={isOverMax}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[14px] text-gray-500">
              <div>
                Max lending amount: <span className="font-semibold text-[#2200FF]">{formatFiat(selectedFiat.code, maxLendForCollateral)}</span>
              </div>
              <button type="button" className="text-[#2200FF] cursor-pointer" onClick={handleMaxReceive}>Max</button>
            </div>
          </div>

          {hasCollateral && (
            <div className="rounded-[16px] border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between text-[14px]">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Loan To Value (LTV)</span>
                  <button type="button" aria-label="What is LTV?" className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer" onClick={() => setLtvInfoOpen(true)}>
                    <Image src="/icons/info.svg" alt="Info" width={18} height={18} />
                  </button>
                </div>
                <div className="font-semibold text-amber-600">{Math.round(LTV * 100)}%</div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <div className="text-gray-600">Borrow Limit</div>
                <LtvUsageText value={fiatReceive} max={maxLendForCollateral} code={selectedFiat.code} />
              </div>
              <div className="mt-2">
                <HealthBar percentage={computeLtvUsagePercent(fiatReceive, maxLendForCollateral)} />
              </div>
              {/* <div className="mt-3 flex items-center justify-between text-[14px]">
                <div className="text-gray-600">Rate</div>
                <div className="font-semibold">{formatNumber(tenureRatePercent, 2)}%</div>
              </div> */}
            </div>
          )}

          {/* Tenure and Info section */}
          {hasReceive && (
            <div className="rounded-[16px] border border-gray-200 bg-white p-4">
              <div className="text-[14px] text-gray-600">Tenure</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {TENURES.map((d) => {
                  const active = d === tenureDays;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTenureDays(d)}
                      className={`rounded-full px-3 py-1.5 text-[13px] ${active ? "bg-[#2200FF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      {d} days
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
                <div className="text-gray-600">Rate for tenure</div>
                <div className="text-right font-semibold">{formatNumber(tenureRatePercent, 2)}%</div>
                <div className="text-gray-600">Interest ({tenureDays}d)</div>
                <div className="text-right font-semibold">{formatFiat(selectedFiat.code, interestForTenure)}</div>
                <div className="text-gray-600">Total to repay in {tenureDays}d</div>
                <div className="text-right font-semibold">{formatFiat(selectedFiat.code, totalRepayForTenure)}</div>
              </div>

              <div className="mt-3 rounded-[12px] bg-[#FFF7D6] p-3 text-[13px] text-gray-700">
                After {tenureDays} days, an extra {formatNumber(OVERDUE_DAILY_RATE * 100, 3)}% per day applies. That’s about {formatFiat(selectedFiat.code, overduePerDayAmount)} extra for each late day.
              </div>
            </div>
          )}
        </section>

        {/* Token select modal */}
        <Modal open={assetModalOpen} onClose={() => setAssetModalOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select token</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {assets.map((a) => {
                const active = assetRowIndex !== null && collateralLines[assetRowIndex]?.symbol === a.symbol;
                const usedElsewhere = collateralLines.some((l, i) => i !== assetRowIndex && l.symbol === a.symbol);
                const disabled = usedElsewhere || active; // already selected elsewhere or same as current
                return (
                  <button
                    key={a.symbol}
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      if (assetRowIndex !== null) {
                        setCollateralLines((prev) => {
                          const next = [...prev];
                          next[assetRowIndex] = { ...next[assetRowIndex], symbol: a.symbol };
                          return next;
                        });
                        setAssetRowIndex(null);
                      }
                      setAssetModalOpen(false);
                    }}
                    aria-disabled={disabled}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 cursor-pointer"} ${active ? "bg-gray-50" : ""}`}
                  >
                    <Image src={a.icon} alt={a.symbol} width={28} height={28} />
                    <div className="flex-1">
                      <div className="text-[14px] font-medium">{a.name} ({a.symbol})</div>
                    </div>
                    {active && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>

        {/* Fiat select modal */}
        <Modal open={fiatModalOpen} onClose={() => setFiatModalOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select fiat</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {fiats.map((f) => {
                const active = f.code === selectedFiat.code;
                return (
                  <button
                    key={f.code}
                    type="button"
                    onClick={() => { setSelectedFiat(f); setFiatModalOpen(false); }}
                    className={`flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50 ${active ? "bg-gray-50" : ""}`}
                  >
                    <Image src={f.icon} alt={f.code} width={28} height={28} />
                    <div className="flex-1">
                      <div className="text-[14px] font-medium">{f.name} ({f.code})</div>
                    </div>
                    {active && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>

        {/* LTV info modal */}
        <Modal open={ltvInfoOpen} onClose={() => setLtvInfoOpen(false)}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-[22px] font-semibold leading-6">What is LTV?</div>
              <button type="button" aria-label="Close" onClick={() => setLtvInfoOpen(false)} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-[16px] leading-7 text-gray-700">
              Loan to Value (LTV) is the ratio between the value of your borrowed funds and the USD value of your collateral. A higher LTV means you’re borrowing closer to the maximum against your collateral and may have higher liquidation risk if prices move.
            </p>
          </div>
        </Modal>

        {/* Bottom action bar */}
        <div className="fixed inset-x-0 z-10 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button
              type="button"
              disabled={!canBorrow}
              className={`w-full rounded-[20px] px-4 py-3 text-[14px] font-medium text-center ${canBorrow ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              onClick={() => { if (canBorrow) setSummaryOpen(true); }}
            >
              Borrow
            </button>
          </div>
        </div>
      </main>

      {/* Borrow Summary modal */}
      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)}>
        <BorrowSummary
          onClose={() => setSummaryOpen(false)}
          onConfirm={() => {
            setSummaryOpen(false);
            setBankOpen(true);
          }}
          collaterals={collateralLines.map((line) => {
            const asset = assets.find((a) => a.symbol === line.symbol)!;
            const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
            return { symbol: asset.symbol, amount: isFinite(amt) ? amt : 0, icon: asset.icon };
          })}
          receiveAmount={Number.isFinite(receiveNumeric) ? receiveNumeric : 0}
          fiatCode={selectedFiat.code}
          ltvPercent={Math.round(LTV * 100)}
          tenureDays={tenureDays}
          baseDailyRate={BASE_DAILY_RATE}
          overdueDailyRate={OVERDUE_DAILY_RATE}
        />
      </Modal>

      {/* Bank selection step */}
      <BankSelectModal
        open={bankOpen}
        onClose={() => setBankOpen(false)}
        accounts={bankAccounts}
        selectedId={selectedBankId}
        onSelect={setSelectedBankId}
        onAddBank={() => { /* route to coming soon for now */ }}
        onConfirmBorrow={() => {
          setBankOpen(false);
          setConfirmProgress(0);
          setConfirmingOpen(true);
          const start = Date.now();
          const total = 1800;
          const timer = window.setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min(100, Math.round((elapsed / total) * 100));
            setConfirmProgress(pct);
            if (pct >= 100) {
              window.clearInterval(timer);
              setConfirmingOpen(false);
              if (borrowResultParam === "fail") setFailedOpen(true); else setSuccessOpen(true);
            }
          }, 120);
        }}
      />

      {/* Borrow confirming modal */}
      <BorrowConfirmingModal
        open={confirmingOpen}
        onClose={() => setConfirmingOpen(false)}
        amountLabel={`${selectedFiat.code} ${formatNumber(receiveNumeric || 0)}`}
        progress={confirmProgress}
      />

      {/* Borrow success modal */}
      <BorrowSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        onViewReceipt={() => {
          setSuccessOpen(false);
          // Optional: route to receipt page
        }}
        amountLabel={`${selectedFiat.code} ${formatNumber(receiveNumeric || 0)}`}
      />

      {/* Borrow failed modal */}
      <BorrowFailedModal
        open={failedOpen}
        onClose={() => setFailedOpen(false)}
        onRetry={() => {
          setFailedOpen(false);
          setSummaryOpen(true);
        }}
      />
    </div>
  );
}

function LtvUsageText({ value, max, code }: { value: string; max: number; code: string }) {
  const pct = Math.round(
    Math.max(0, Math.min(100, (parseFloat((value || "0").replace(/,/g, "")) || 0) / (max || 1) * 100))
  );
  return (
    <div className="text-gray-800 font-medium">{pct}%</div>
  );
}


