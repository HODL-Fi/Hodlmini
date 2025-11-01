"use client";

import React from "react";
import Image from "next/image";
import BorrowTopNav from "@/components/BorrowTopNav";
import { CustomInput } from "@/components/inputs";
import Modal from "@/components/ui/Modal";
import HealthBar from "@/components/HeathBar";

export default function BorrowPage() {
  const assets = React.useMemo(() => ([
    { symbol: "ETH", name: "Ethereum", icon: "/assets/eth.svg", priceUsd: 3500, balance: 4.0 },
    { symbol: "WETH", name: "Wrapped ETH", icon: "/assets/weth.svg", priceUsd: 3500, balance: 0 },
    { symbol: "DAI", name: "DAI", icon: "/assets/dai.svg", priceUsd: 1, balance: 0 },
    { symbol: "cNGN", name: "compliant NGN", icon: "/assets/cngn.svg", priceUsd: 1/1500, balance: 0 },
    { symbol: "WKC", name: "Wikicat", icon: "/assets/wkc.svg", priceUsd: 0.000001, balance: 0 },
    { symbol: "USDT", name: "Tether", icon: "/assets/usdt.svg", priceUsd: 1, balance: 12000 },
    { symbol: "USDC", name: "USD Coin", icon: "/assets/usdc.svg", priceUsd: 1, balance: 8800 },
    { symbol: "BNB", name: "BNB", icon: "/assets/bnb.svg", priceUsd: 600, balance: 9.3 },
  ]), []);
  const fiats = React.useMemo(() => ([
    { code: "NGN", name: "Nigerian Naira", icon: "/fiat/ngn.svg", usdToFiat: 1500 },
    { code: "GHC", name: "Ghanian Cedi", icon: "/fiat/ghs.svg", usdToFiat: 15 },
    { code: "KHS", name: "Kenyan Shillings", icon: "/fiat/khs.svg", usdToFiat: 130 },
    { code: "ZAR", name: "South African Rand", icon: "/fiat/zar.svg", usdToFiat: 18 },
  ]), []);

  const [selectedAsset, setSelectedAsset] = React.useState(assets[0]);
  const [selectedFiat, setSelectedFiat] = React.useState(fiats[0]);
  const [collateral, setCollateral] = React.useState("");
  const [fiatReceive, setFiatReceive] = React.useState("");
  const [assetModalOpen, setAssetModalOpen] = React.useState(false);
  const [fiatModalOpen, setFiatModalOpen] = React.useState(false);
  const [ltvInfoOpen, setLtvInfoOpen] = React.useState(false);

  const LTV = 0.7;
  const RATE_APR = 3.8; // mock

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

  function handleMaxCollateral() {
    setCollateral(String(selectedAsset.balance));
  }

  function handleMaxReceive() {
    const currentColl = parseFloat(collateral || "0");
    const hasCollateral = isFinite(currentColl) && currentColl > 0;
    const usd = (hasCollateral ? currentColl : 0) * selectedAsset.priceUsd;
    const maxFiat = usd * LTV * selectedFiat.usdToFiat;
    // This Max applies only to the receive input; it should not mutate collateral
    setFiatReceive(maxFiat > 0 ? formatNumber(maxFiat) : "");
  }

  // keep receive independent; no auto-overwrite on collateral/asset/fiat changes

  const maxLendForCollateral = React.useMemo(() => {
    const v = parseFloat(collateral || "0");
    if (!isFinite(v) || v <= 0) return 0;
    const usd = v * selectedAsset.priceUsd;
    return usd * LTV * selectedFiat.usdToFiat;
  }, [collateral, selectedAsset, selectedFiat]);

  const approxUsdForBalance = React.useMemo(() => {
    const usd = selectedAsset.balance * selectedAsset.priceUsd;
    return usd;
  }, [selectedAsset]);

  const receiveNumeric = React.useMemo(() => parseFloat((fiatReceive || "").replace(/,/g, "")), [fiatReceive]);
  const hasReceive = Number.isFinite(receiveNumeric) && receiveNumeric > 0;
  const collateralNumeric = parseFloat(collateral || "0");
  const hasCollateral = Number.isFinite(collateralNumeric) && collateralNumeric > 0;
  const isOverMax = hasReceive && maxLendForCollateral > 0 && receiveNumeric > maxLendForCollateral;
  const canBorrow = hasCollateral && hasReceive && !isOverMax;

  return (
    <div className="min-h-dvh">
      <main className="px-2 py-4 text-left">
        <BorrowTopNav />
        <section className="mt-4 space-y-6">
          <div>
            <div className="text-[18px] font-semibold">I want to Collateralize</div>
            <div className="mt-2">
              <CustomInput
                value={collateral}
                onChange={setCollateral}
                tokenLabel={selectedAsset.symbol}
                tokenIconSrc={selectedAsset.icon}
                onDropdownClick={() => setAssetModalOpen(true)}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[14px] text-gray-500">
              <div>
                Balance: {formatNumber(selectedAsset.balance, 2)} {selectedAsset.symbol}
                <span className="ml-2">≈ ${formatNumber(approxUsdForBalance, 2)}</span>
              </div>
              <button type="button" className="text-[#2200FF] cursor-pointer" onClick={handleMaxCollateral}>Max</button>
            </div>
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

          {parseFloat(collateral || "0") > 0 && (
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
              <div className="mt-3 flex items-center justify-between text-[14px]">
                <div className="text-gray-600">Rate</div>
                <div className="font-semibold">{RATE_APR}%</div>
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
                const active = a.symbol === selectedAsset.symbol;
                return (
                  <button
                    key={a.symbol}
                    type="button"
                    onClick={() => { setSelectedAsset(a); setAssetModalOpen(false); }}
                    className={`flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50 ${active ? "bg-gray-50" : ""}`}
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
            >
              Borrow
            </button>
          </div>
        </div>
      </main>
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


