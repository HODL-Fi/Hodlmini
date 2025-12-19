"use client";

import React from "react";
import Image from "next/image";
import TokenAvatar from "@/components/TokenAvatar";

type Position = { symbol: string; amount: number };

type StaticAsset = {
  symbol: string;
  name: string;
  icon: string;
  priceUsd: number;
  collateralFactor?: number;
  liquidationThreshold?: number;
};

type WalletAssetLike = {
  symbol: string;
  icon: string;
  chainKey: string;
  // Optional live USD price for this token (per 1 unit), if available.
  price?: number;
};

type CollateralPositionLike = {
  symbol: string;
  cf: string | number;
};

type ChainMeta = { key: string; name: string; icon: string };

type Props = {
  positions: Position[];
  assets: StaticAsset[];
  walletAssets: WalletAssetLike[];
  selectedChain: string;
  allCollateralPositions: CollateralPositionLike[];
  chains: ChainMeta[];
  onEdit: (mode: "deposit" | "withdraw", index: number) => void;
  onShowCfLt: (symbol: string, cfFraction: number, ltFraction: number) => void;
};

function formatNumber(n: number, d = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(n);
}

export default function VaultCollateralPositions({
  positions,
  assets,
  walletAssets,
  selectedChain,
  allCollateralPositions,
  chains,
  onEdit,
  onShowCfLt,
}: Props) {
  const getAsset = React.useCallback(
    (sym: string) => assets.find((a) => a.symbol === sym),
    [assets]
  );

  return (
    <section className="mt-4 rounded-[16px] border border-gray-200 bg-white p-2">
      <div className="px-2 py-2 text-[14px] font-semibold">Collateral positions</div>
      <div className="divide-y divide-gray-100">
        {positions.length === 0 && (
          <div className="px-2 py-6 text-center text-[14px] text-gray-600">
            No collateral yet. Deposit assets to start borrowing.
          </div>
        )}
        {positions.map((p, idx) => {
          const a = getAsset(p.symbol);
          const symbol = a?.symbol ?? p.symbol;
          const symbolUpper = symbol.toUpperCase();

          // ABSOLUTE source of price: Dextools-powered wallet price only.
          const walletAssetForPosition = walletAssets.find(
            (wa) =>
              wa.symbol?.toUpperCase() === symbolUpper &&
              (selectedChain === "ALL" || wa.chainKey === selectedChain)
          );

          const priceUsd = walletAssetForPosition?.price ?? 0;
          const val = p.amount * priceUsd;

          const backendCf = allCollateralPositions.find(
            (cp) => cp.symbol?.toUpperCase() === symbolUpper
          );
          const backendCfBps = backendCf ? Number(backendCf.cf) || 0 : 0;
          const hasBackendCf = !!backendCf && backendCfBps > 0;

          const cfPercentExact = hasBackendCf
            ? backendCfBps / 100
            : (a?.collateralFactor ?? 0) * 100;

          const ltPercentExact = hasBackendCf
            ? cfPercentExact + 5
            : a?.liquidationThreshold != null
              ? (a?.liquidationThreshold ?? 0) * 100
              : cfPercentExact + 5;

          const iconForPosition = walletAssetForPosition?.icon ?? a?.icon;
          const chainChip =
            walletAssetForPosition &&
            chains.find((c) => c.key === walletAssetForPosition.chainKey);

          return (
            <div
              key={`${p.symbol}-${idx}`}
              className="flex items-center justify-between px-2 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <TokenAvatar symbol={symbol} iconSrc={iconForPosition} size={28} />
                  {chainChip && chainChip.icon && (
                    <div className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 shadow">
                      <Image src={chainChip.icon} alt={chainChip.name} width={14} height={14} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[14px] font-medium">
                    {p.amount} {symbol}
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-gray-600">
                    <span>
                      ${formatNumber(val)} · CF {Math.round(cfPercentExact)}% · LT{" "}
                      {Math.round(ltPercentExact)}%
                    </span>
                    <button
                      type="button"
                      aria-label="What are CF and LT?"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        onShowCfLt(symbol, cfPercentExact / 100, ltPercentExact / 100)
                      }
                    >
                      <Image src="/icons/info.svg" alt="Info" width={16} height={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2">
                <button
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium cursor-pointer"
                  onClick={() => onEdit("deposit", idx)}
                >
                  Deposit
                </button>
                <button
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium cursor-pointer"
                  onClick={() => onEdit("withdraw", idx)}
                >
                  Withdraw
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


