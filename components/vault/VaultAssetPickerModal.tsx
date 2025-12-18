"use client";

import React from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

type Position = { symbol: string; amount: number };

type WalletAssetLike = {
  symbol: string;
  name: string;
  icon: string;
  chainKey: string;
  amount: number;
  price: number;
};

type StaticAsset = {
  symbol: string;
  name: string;
  icon: string;
};

type ChainMeta = { key: string; name: string; icon: string };

type Props = {
  open: boolean;
  mode: "deposit" | "withdraw";
  walletAssets: WalletAssetLike[];
  positions: Position[];
  assets: StaticAsset[];
  selectedChain: string;
  chains: ChainMeta[];
  formatAmount: (n: number) => string;
  formatUsd: (n: number) => string;
  onClose: () => void;
  onSelectDepositAsset: (symbol: string) => void;
  onSelectWithdrawPosition: (index: number) => void;
};

export default function VaultAssetPickerModal({
  open,
  mode,
  walletAssets,
  positions,
  assets,
  selectedChain,
  chains,
  formatAmount,
  formatUsd,
  onClose,
  onSelectDepositAsset,
  onSelectWithdrawPosition,
}: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <div className="space-y-3">
          <div className="text-[18px] font-semibold">
            {mode === "deposit" ? "Select asset to deposit" : "Select asset to withdraw"}
          </div>
          <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
            {mode === "deposit" ? (
              walletAssets
                .filter((a) => selectedChain === "ALL" || a.chainKey === selectedChain)
                .map((a, idx) => {
                  const usd = a.amount * (a.price || 0);
                  const chainChip = chains.find((c) => c.key === a.chainKey);
                  return (
                    <button
                      key={`${a.symbol}-${a.chainKey}-${idx}`}
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectDepositAsset(a.symbol);
                      }}
                      className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50"
                    >
                      <div className="relative">
                        {a.icon ? (
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-white">
                            <Image
                              src={a.icon}
                              alt={a.symbol}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                            {a.symbol.slice(0, 2)}
                          </div>
                        )}
                        {chainChip && chainChip.icon && (
                          <div className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 shadow">
                            <Image src={chainChip.icon} alt={chainChip.name} width={16} height={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-semibold">{a.symbol}</div>
                        <div className="text-[12px] text-gray-600">
                          {formatAmount(a.amount)} {a.symbol}
                        </div>
                      </div>
                      <div className="text-right text-[14px] font-semibold">
                        {usd > 0 ? formatUsd(usd) : "$0.00"}
                      </div>
                    </button>
                  );
                })
            ) : (
              positions.map((p, i) => {
                const a = assets.find((x) => x.symbol === p.symbol);
                const symbol = a?.symbol ?? p.symbol;
                const name = a?.name ?? p.symbol;
                const disabled = !p.amount || p.amount <= 0;
                return (
                  <button
                    key={`${p.symbol}-${i}`}
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      onClose();
                      onSelectWithdrawPosition(i);
                    }}
                    aria-disabled={disabled}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left ${
                      disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    {a?.icon ? (
                      <Image src={a.icon} alt={symbol} width={24} height={24} />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                        {symbol.slice(0, 3).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 text-[14px] font-medium">
                      {name} ({symbol})
                    </div>
                    <div className="text-[12px]">{p.amount}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}


