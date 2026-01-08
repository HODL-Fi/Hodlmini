"use client";

export const dynamic = 'force-dynamic';

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";
import { CustomInput } from "@/components/inputs";
import Image from "next/image";
import TxConfirmModal from "@/components/wallet/TxConfirmModal";
import ProcessingModal from "@/components/wallet/ProcessingModal";
import TxSuccessModal from "@/components/wallet/TxSuccessModal";
import TxReceiptModal from "@/components/wallet/TxReceiptModal";
import TxFailedModal from "@/components/wallet/TxFailedModal";
import { CHAIN_IDS } from "@/utils/constants/chainIds";
import { LOCAL_TOKEN_ICONS } from "@/utils/constants/localTokenIcons";
import { useSend, type SendResponse } from "@/hooks/wallet/useSend";
import { useGetAllChainBalances } from "@/hooks/wallet/useGetTokenWalletBalance";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { mapHexChainIdToDextools, makeDextoolsPriceKey } from "@/utils/prices/dextools";
import { getWethAddressForChain } from "@/utils/constants/wethAddresses";
import { useRouter } from "next/navigation";
import { getTokenDecimals, ETHER_ADDRESS } from "@/utils/constants/tokenDecimals";

export default function SendPage() {
  const router = useRouter();
  const CHAINS = React.useMemo(() => {
    const allChains = [
      { key: "ETH", name: "Ethereum", icon: "/chains/ethereum.svg" },
      { key: "BSC", name: "BNB Smart Chain", icon: "/chains/bsc.svg" },
      { key: "LSK", name: "Lisk", icon: "/chains/lisk.svg" },
      { key: "BASE", name: "Base", icon: "/chains/base.svg" },
      { key: "TEST", name: "Test Network", icon: "/chains/test.svg" },
    ];

    return allChains.filter((chain) => chain.key in CHAIN_IDS);
  }, []);

  const LOCAL_ICONS = React.useMemo(() => [...LOCAL_TOKEN_ICONS], []);

  const getAssetIcon = React.useCallback(
    (symbol: string, apiLogo: string | null | undefined): string => {
      const symbolLower = symbol.toLowerCase();
      if (LOCAL_ICONS.includes(symbolLower)) {
        return `/assets/${symbolLower}.svg`;
      }
      if (apiLogo) {
        return apiLogo;
      }
      return "";
    },
    [LOCAL_ICONS]
  );

  const [assetOpen, setAssetOpen] = React.useState(false);
  const [chainOpen, setChainOpen] = React.useState(false);
  const [selectedChain, setSelectedChain] = React.useState(CHAINS[0]);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState("");
  const [toAddress, setToAddress] = React.useState("");

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [processingOpen, setProcessingOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [failedOpen, setFailedOpen] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [lastTxId, setLastTxId] = React.useState<string | null>(null);
  const [lastTxStatus, setLastTxStatus] = React.useState<string | null>(null);
  const [lastTxReceipt, setLastTxReceipt] = React.useState<SendResponse | null>(null);
  const [lastSentDisplayAmount, setLastSentDisplayAmount] = React.useState<string | null>(null);
  const [lastSentSymbol, setLastSentSymbol] = React.useState<string | null>(null);
  const { mutateAsync: sendTx, isPending: isSending } = useSend();

  const canSend = Boolean(amount) && Boolean(toAddress);

  const selectedChainIdHexRaw =
    CHAIN_IDS[selectedChain.key as keyof typeof CHAIN_IDS] ?? CHAIN_IDS.BASE;
  const selectedChainIdHex = typeof selectedChainIdHexRaw === "string"
    ? selectedChainIdHexRaw
    : `0x${(selectedChainIdHexRaw as number).toString(16)}`;

  const parsedAmount = React.useMemo(() => {
    const n = Number((amount || "").replace(/,/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  // Wallet balances + price for selected asset
  const chainList = React.useMemo(() => Object.values(CHAIN_IDS), []);
  const { data: balancesByChain } = useGetAllChainBalances(chainList);

  type AssetOption = { symbol: string; name: string; icon: string };

  const assetOptions = React.useMemo<AssetOption[]>(() => {
    const balances = balancesByChain?.[selectedChainIdHex];
    if (!balances) return [];

    return balances
      .filter((t) => {
        const n = Number(t.balance);
        return Number.isFinite(n) && n > 0;
      })
      .map((t) => ({
        symbol: t.symbol,
        name: t.name,
        icon: getAssetIcon(t.symbol, t.logo),
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [balancesByChain, selectedChainIdHex, getAssetIcon]);

  React.useEffect(() => {
    if (!assetOptions.length) return;
    if (!selectedAssetSymbol) {
      setSelectedAssetSymbol(assetOptions[0].symbol);
    }
  }, [assetOptions, selectedAssetSymbol]);

  const selectedAsset = React.useMemo<AssetOption | null>(() => {
    if (!assetOptions.length) return null;
    const sym = selectedAssetSymbol ?? assetOptions[0].symbol;
    return assetOptions.find((a) => a.symbol === sym) ?? assetOptions[0];
  }, [assetOptions, selectedAssetSymbol]);

  const selectedTokenBalance = React.useMemo(() => {
    if (!balancesByChain || !selectedAsset) return null;
    const balances = balancesByChain[selectedChainIdHex];
    if (!balances) return null;
    return balances.find((t) => t.symbol === selectedAsset.symbol) || null;
  }, [balancesByChain, selectedChainIdHex, selectedAsset]);

  const priceTokens = React.useMemo(() => {
    if (!selectedTokenBalance) return [];

    const dextoolsChain = mapHexChainIdToDextools(selectedChainIdHex);
    if (!dextoolsChain) return [];

    let addr = selectedTokenBalance.contractAddress;

    const isEthNative =
      selectedTokenBalance.symbol.toUpperCase() === "ETH" &&
      (!addr ||
        addr === "N/A" ||
        addr === "0x0000000000000000000000000000000000000001");

    if (isEthNative) {
      const wethAddr = getWethAddressForChain(selectedChainIdHex);
      if (wethAddr) {
        addr = wethAddr;
      } else {
        return [];
      }
    } else if (!addr || addr === "N/A") {
      return [];
    }

    return [{ chain: dextoolsChain, address: addr }];
  }, [selectedTokenBalance, selectedChainIdHex]);

  const { data: tokenPrices } = useTokenPrices(priceTokens as any);

  const tokenPrice = React.useMemo(() => {
    if (!priceTokens.length || !tokenPrices) return 0;
    const { chain, address } = priceTokens[0];
    const key = makeDextoolsPriceKey(chain, address);
    const entry = (tokenPrices as any)[key];
    return entry?.price ?? 0;
  }, [priceTokens, tokenPrices]);

  const walletBalanceTokens = React.useMemo(() => {
    const raw = selectedTokenBalance?.balance;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [selectedTokenBalance]);

  function toSmallestUnits(amountStr: string, decimals: number): string {
    const cleaned = (amountStr || "").replace(/,/g, "").trim();
    if (!cleaned) return "0";
    const negative = cleaned.startsWith("-");
    const unsigned = negative ? cleaned.slice(1) : cleaned;
    const [wholePartRaw, fracPartRaw = ""] = unsigned.split(".");
    const wholePart = wholePartRaw.replace(/^0+/, "") || "0";
    const fracPart = fracPartRaw.slice(0, decimals).padEnd(decimals, "0");
    const combined = `${wholePart}${fracPart}`.replace(/^0+/, "") || "0";
    return negative ? `-${combined}` : combined;
  }

  const amountUsd = parsedAmount * tokenPrice;
  const walletBalanceUsd = walletBalanceTokens * tokenPrice;

  const tokenAddress = React.useMemo(() => {
    if (!selectedTokenBalance) return "0x0000000000000000000000000000000000000000";
    
    const symbol = selectedTokenBalance.symbol.toUpperCase();
    const contractAddr = selectedTokenBalance.contractAddress;
    
    // If ETH (by symbol or by the special ETH address), use ETHER_ADDRESS
    if (symbol === "ETH" || 
        contractAddr === ETHER_ADDRESS || 
        contractAddr === "0x0000000000000000000000000000000000000001") {
      return ETHER_ADDRESS;
    }
    
    // For other tokens, use the contract address or fallback
    return contractAddr ?? "0x0000000000000000000000000000000000000000";
  }, [selectedTokenBalance]);

  function formatAmount(n: number) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    }).format(n);
  }

  function formatUsd(n: number) {
    return `$${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n || 0)}`;
  }

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Send" subtitle="Transfer assets to another address" showBack />
        </div>

        <section className="mt-4 space-y-4">
          <div>
            <div className="text-[14px] text-gray-600">Network</div>
            <button
              type="button"
              className="mt-1 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-white px-3 py-3 cursor-pointer"
              onClick={() => setChainOpen(true)}
            >
              <div className="flex items-center gap-2">
                <Image src={selectedChain.icon} alt={selectedChain.name} width={20} height={20} />
                <span className="text-[14px] font-medium">{selectedChain.name}</span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
          <div>
            <div className="text-[14px] text-gray-600">Asset</div>
            <button
              type="button"
              className="mt-1 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-white px-3 py-3 cursor-pointer"
              onClick={() => setAssetOpen(true)}
            >
              <div className="flex items-center gap-2">
                {selectedAsset ? (
                  <>
                    <Image src={selectedAsset.icon} alt={selectedAsset.symbol} width={20} height={20} />
                    <span className="text-[14px] font-medium">{selectedAsset.name}</span>
                  </>
                ) : (
                  <span className="text-[14px] font-medium text-gray-400">No assets</span>
                )}
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
          <div>
            <div className="text-[14px] text-gray-600">To</div>
            <input
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x... recipient"
              className="mt-1 w-full rounded-[14px] border border-gray-200 bg-white px-3 py-3 text-[14px] outline-none"
            />
          </div>
          <div>
            <div className="text-[14px] text-gray-600">Amount</div>
            <CustomInput
              value={amount}
              onChange={setAmount}
              tokenLabel={selectedAsset?.symbol ?? ""}
              tokenIconSrc={selectedAsset?.icon}
              onDropdownClick={() => setAssetOpen(true)}
            />
            <div className="mt-1 flex items-center justify-between text-[12px] text-gray-600">
              <div className="flex flex-col">
                <div>
                  Wallet balance:{" "}
                  <span className="font-medium">
                    {formatAmount(walletBalanceTokens)} {selectedAsset?.symbol ?? ""}
                  </span>
                  {tokenPrice > 0 && (
                    <span className="ml-1 text-gray-500">
                      ({formatUsd(walletBalanceUsd)})
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-gray-500">
                  ≈ <span className="font-medium">{formatUsd(amountUsd)}</span>
                </div>
              </div>
              <button
                type="button"
                className="text-[#2200FF] cursor-pointer"
                onClick={() => {
                  setAmount(walletBalanceTokens ? String(walletBalanceTokens) : "");
                }}
              >
                Max
              </button>
            </div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)] z-10">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button
              type="button"
              disabled={!canSend}
              className={`w-full rounded-[20px] px-4 py-3 text-[14px] font-medium text-center ${
                canSend ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => setConfirmOpen(true)}
            >
              Send
            </button>
          </div>
        </div>

        {/* Asset modal */}
        <Modal open={assetOpen} onClose={() => setAssetOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select asset</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {assetOptions.map((a) => (
                <button
                  key={a.symbol}
                  type="button"
                  onClick={() => {
                    setSelectedAssetSymbol(a.symbol);
                    setAssetOpen(false);
                  }}
                  className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50"
                >
                  <Image src={a.icon} alt={a.symbol} width={24} height={24} />
                  <div className="text-[14px]">{a.name}</div>
                </button>
              ))}
            </div>
          </div>
        </Modal>
        {/* Chain modal */}
        <Modal open={chainOpen} onClose={() => setChainOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select network</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {CHAINS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    setSelectedChain(c);
                    setChainOpen(false);
                  }}
                  className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50"
                >
                  <Image src={c.icon} alt={c.name} width={24} height={24} />
                  <div className="text-[14px]">{c.name}</div>
                </button>
              ))}
            </div>
          </div>
        </Modal>

        <TxConfirmModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm send"
          rows={[
            { label: "Asset", value: `${selectedAsset?.symbol ?? ""}` },
            { label: "Network", value: selectedChain.name },
            { label: "To", value: toAddress || "—" },
            { label: "Amount", value: `${amount || "0"} ${selectedAsset?.symbol ?? ""}` },
            { label: "Fee", value: "$0.00" },
          ]}
          confirmLabel={isSending ? "Sending..." : "Send now"}
          onConfirm={async () => {
            if (!canSend || parsedAmount <= 0) return;

            setConfirmOpen(false);
            setProgress(0);
            setProcessingOpen(true);
            setLastSentDisplayAmount(amount || String(parsedAmount));
            setLastSentSymbol(selectedAsset?.symbol ?? null);

            try {
              const decimals = getTokenDecimals(
                selectedTokenBalance?.decimals,
                selectedTokenBalance?.symbol,
                selectedTokenBalance?.contractAddress
              );
              const smallestUnits = toSmallestUnits(amount, decimals);

              const res = await sendTx({
                chainId: selectedChainIdHex,
                toAddress,
                tokenAddress,
                amount: smallestUnits,
              });

              setLastTxReceipt(res);

              const anyRes = res as any;
              const txId = anyRes.id ?? anyRes.transactionHash ?? "";
              const txStatus = (anyRes.status as string | undefined) ?? "success";
              setLastTxId(txId || null);
              setLastTxStatus(txStatus);

              // simple fake progress animation while we have no server-side status stream
              const start = Date.now();
              const total = 1200;
              const t = window.setInterval(() => {
                const p = Math.min(100, Math.round(((Date.now() - start) / total) * 100));
                setProgress(p);
                if (p >= 100) {
                  window.clearInterval(t);
                  setProcessingOpen(false);
                  setSuccessOpen(true);
                }
              }, 120);
            } catch {
              setProcessingOpen(false);
              setFailedOpen(true);
            }
          }}
        />
        <ProcessingModal
          open={processingOpen}
          onClose={() => setProcessingOpen(false)}
          title="Processing send"
          progress={progress}
        />
        <TxSuccessModal
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          onViewReceipt={() => {
            setSuccessOpen(false);
            setReceiptOpen(true);
          }}
        />
        <TxFailedModal
          open={failedOpen}
          onClose={() => setFailedOpen(false)}
          onRetry={() => {
            setFailedOpen(false);
            setConfirmOpen(true);
          }}
        />
        <TxReceiptModal
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          receipt={lastTxReceipt ? {
            from: lastTxReceipt.from,
            to: (lastTxReceipt as any).toAddress ?? lastTxReceipt.to,
            amount: lastTxReceipt.amount,
            displayAmount: lastSentDisplayAmount ?? undefined,
            tokenSymbol: lastSentSymbol ?? undefined,
            transactionHash: lastTxReceipt.transactionHash ?? lastTxId ?? undefined,
            createdAt: lastTxReceipt.createdAt,
          } : undefined}
        />
      </main>
    </div>
  );
}

