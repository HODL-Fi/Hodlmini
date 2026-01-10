"use client";

export const dynamic = 'force-dynamic';

import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { ArrowLeftIcon } from "@customIcons";
import React from "react";
import Modal from "@/components/ui/Modal";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import useGetUserTxHistory from "@/hooks/user/useGetUserTxHistory";
import { parseTransaction, ParsedTransaction } from "@/utils/transactions/parseTransaction";
import { formatTransactionAmount, formatTransactionTimestamp, formatTransactionHash } from "@/utils/transactions/formatTransaction";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { useTokenMetadataBatch } from "@/hooks/prices/useTokenMetadata";
import { mapHexChainIdToDextools, makeDextoolsPriceKey } from "@/utils/prices/dextools";
import { useNgnConversion } from "@/hooks/useNgnConversion";
import { CNGN_BASE_ADDRESS } from "@/utils/constants/cngn";
import { isCngnToken } from "@/utils/transactions/parseTransaction";
import { getWethAddressForChain } from "@/utils/constants/wethAddresses";
import { LOCAL_TOKEN_ICONS } from "@/utils/constants/localTokenIcons";
import { getBankNameByCode } from "@/utils/banks/bankLogos";
import { getBankLogo } from "@/utils/banks/bankLogos";

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-[14px] font-medium text-gray-500">{left}</div>
      <div className="text-right text-[14px] whitespace-pre-line">{right}</div>
    </div>
  );
}

function TokenRow({ left, tokenSymbol, tokenAddress, tokenLogo }: { left: string; tokenSymbol: string | null; tokenAddress: string | null; tokenLogo?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-[14px] font-medium text-gray-500">{left}</div>
      <div className="flex items-center justify-end gap-2 text-right text-[14px]">
        {tokenLogo ? (
          <Image
            src={tokenLogo}
            alt={tokenSymbol || "Token"}
            width={20}
            height={20}
            className="rounded-full flex-shrink-0"
            onError={(e) => {
              // Hide logo if it fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : null}
        <span>{tokenSymbol || "Token"}</span>
      </div>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[12px] text-gray-700 hover:bg-gray-200 cursor-pointer"
    >
      {copied ? "Copied!" : label}
      <Image src="/icons/copy.svg" alt="Copy" width={14} height={14} />
    </button>
  );
}

export default function TransactionDetailPage() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id ?? "");
  const { data: transactions, isLoading } = useGetUserTxHistory();
  const { convertUsdToNgn } = useNgnConversion();

  // Find the transaction
  const transaction = React.useMemo(() => {
    if (!transactions) return null;
    return transactions.find((tx) => String(tx.id) === id) ?? null;
  }, [transactions, id]);

  // Build price token request for this transaction (including metadata)
  const priceTokens = React.useMemo(() => {
    if (!transaction) return [];
    
    // For offramp transactions, get token address from collateralAssets
    let address: string | null = null;
    if (transaction.transactionType === "SWAP" && transaction.collateralAssets && transaction.collateralAssets.length > 0) {
      address = transaction.collateralAssets[0].toLowerCase();
    } else {
      const addressPattern = /0x[a-fA-F0-9]{40}/;
      const match = transaction.remark.match(addressPattern);
      if (!match) return [];
      address = match[0].toLowerCase();
    }
    
    if (!address) return [];

    const dextoolsChain = mapHexChainIdToDextools(transaction.walletType);
    if (!dextoolsChain) return [];

    // For Ether address, use WETH address for pricing and metadata
    let priceAddress = address;
    if (address === "0x0000000000000000000000000000000000000001") {
      const wethAddr = getWethAddressForChain(transaction.walletType);
      if (!wethAddr) return []; // Skip if no WETH address for this chain
      priceAddress = wethAddr.toLowerCase();
    }

    return [{ chain: dextoolsChain, address: priceAddress }];
  }, [transaction]);

  const { data: tokenPrices } = useTokenPrices(priceTokens as any);
  const { data: tokenMetadata } = useTokenMetadataBatch(priceTokens as any);

  // Parse transaction
  const parsedTx = React.useMemo<ParsedTransaction | null>(() => {
    if (!transaction) return null;

    // Extract token address - for offramp, use collateralAssets
    let tokenAddress: string | null = null;
    if (transaction.transactionType === "SWAP" && transaction.collateralAssets && transaction.collateralAssets.length > 0) {
      tokenAddress = transaction.collateralAssets[0].toLowerCase();
    } else {
      const addressPattern = /0x[a-fA-F0-9]{40}/;
      const match = transaction.remark.match(addressPattern);
      tokenAddress = match ? match[0].toLowerCase() : null;
    }

    // Get token metadata
    let metadata: { symbol?: string | null; decimals?: number | null; name?: string | null } = {};
    if (tokenAddress && tokenMetadata) {
      const dextoolsChain = mapHexChainIdToDextools(transaction.walletType);
      if (dextoolsChain) {
        // For Ether address, use WETH address for metadata lookup
        let metaAddress = tokenAddress;
        if (tokenAddress === "0x0000000000000000000000000000000000000001") {
          const wethAddr = getWethAddressForChain(transaction.walletType);
          if (wethAddr) {
            metaAddress = wethAddr.toLowerCase();
          }
        }
        const priceKey = makeDextoolsPriceKey(dextoolsChain, metaAddress);
        const meta = tokenMetadata[priceKey];
        if (meta) {
          metadata = {
            symbol: meta.symbol ?? null,
            decimals: meta.decimals ?? null,
            name: meta.name ?? null,
          };
        }
      }
    }

    return parseTransaction(transaction, metadata);
  }, [transaction, tokenMetadata]);

  // Get token price
  const tokenPriceUsd = React.useMemo(() => {
    if (!parsedTx || !parsedTx.tokenAddress || !tokenPrices) return 0;
    const dextoolsChain = mapHexChainIdToDextools(parsedTx.walletType);
    if (!dextoolsChain) return 0;
    
    // For Ether address, use WETH address for price lookup
    let priceAddress = parsedTx.tokenAddress;
    if (parsedTx.tokenAddress.toLowerCase() === "0x0000000000000000000000000000000000000001") {
      const wethAddr = getWethAddressForChain(parsedTx.walletType);
      if (wethAddr) {
        priceAddress = wethAddr.toLowerCase();
      }
    }
    
    const priceKey = makeDextoolsPriceKey(dextoolsChain, priceAddress);
    return tokenPrices[priceKey]?.price ?? 0;
  }, [parsedTx, tokenPrices]);

  // Format amount (returns string like "0.007103 TOKEN (₦0.01)")
  const amountString = React.useMemo(() => {
    if (!parsedTx) return "0.00";
    return formatTransactionAmount(parsedTx, tokenPriceUsd, convertUsdToNgn);
  }, [parsedTx, tokenPriceUsd, convertUsdToNgn]);

  // Parse amount string to extract parts for logo replacement
  const amountParts = React.useMemo(() => {
    if (!amountString) return { number: "0.00", symbol: null, secondary: null };
    
    // Match pattern: "0.007103 TOKEN (₦0.01)" or "0.007103 TOKEN"
    const match = amountString.match(/^([\d.,]+)\s+(\w+)(\s*\([^)]+\))?$/);
    if (match) {
      return {
        number: match[1],
        symbol: match[2],
        secondary: match[3] || null,
      };
    }
    
    // Fallback: return as-is
    return { number: amountString, symbol: null, secondary: null };
  }, [amountString]);

  // Get token logo
  const tokenLogo = React.useMemo<string | undefined>(() => {
    if (!parsedTx?.tokenAddress) return undefined;
    
    let logo: string | undefined = undefined;
    const LOCAL_ICONS = [...LOCAL_TOKEN_ICONS];

    // Check local token icons first (by symbol)
    if (parsedTx.tokenSymbol) {
      const symbolLower = parsedTx.tokenSymbol.toLowerCase();
      if (LOCAL_ICONS.includes(symbolLower)) {
        logo = `/assets/${symbolLower}.svg`;
      }
    }

    // Check Ether by address
    if (!logo) {
      const normalizedAddr = parsedTx.tokenAddress.toLowerCase();
      const etherAddr = "0x0000000000000000000000000000000000000001";
      if (normalizedAddr === etherAddr) {
        if (LOCAL_ICONS.includes("eth")) {
          logo = "/assets/eth.svg";
        }
      }
    }

    // Check cNGN by address
    if (!logo) {
      const normalizedAddr = parsedTx.tokenAddress.toLowerCase();
      const cngnAddr = CNGN_BASE_ADDRESS.toLowerCase();
      if (normalizedAddr === cngnAddr || normalizedAddr === `0x${cngnAddr}`) {
        logo = "/assets/cngn.svg";
      }
    }

    // Then try DEXTools metadata
    if (!logo && tokenMetadata && parsedTx.tokenAddress) {
      const dextoolsChain = mapHexChainIdToDextools(parsedTx.walletType);
      if (dextoolsChain) {
        // For Ether, use WETH address for metadata lookup
        let metaAddress = parsedTx.tokenAddress;
        if (parsedTx.tokenAddress.toLowerCase() === "0x0000000000000000000000000000000000000001") {
          const wethAddr = getWethAddressForChain(parsedTx.walletType);
          if (wethAddr) {
            metaAddress = wethAddr.toLowerCase();
          }
        }
        const priceKey = makeDextoolsPriceKey(dextoolsChain, metaAddress);
        const meta = tokenMetadata[priceKey];
        if (meta?.logo) {
          logo = meta.logo;
        }
      }
    }

    return logo;
  }, [parsedTx, tokenMetadata]);

  const status = parsedTx?.status ?? ("success" as const);
  const date = parsedTx ? formatTransactionTimestamp(parsedTx.createdAt) : "N/A";
  const type = parsedTx?.type ?? ("deposit" as const);

  const [reportOpen, setReportOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const receiptRef = React.useRef<HTMLDivElement | null>(null);

  async function shareAsImage() {
    try {
      if (!receiptRef.current) {
        console.warn("[shareAsImage] receiptRef is null");
        return;
      }
      setIsSharing(true);
      // Wait for state update to reflect in DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      const { toBlob } = await import("html-to-image");
      const node = receiptRef.current;
      const width = node.scrollWidth;
      const pad = 48;
      const height = node.scrollHeight + pad;
      const blob = await toBlob(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width,
        height,
        style: { width: `${width}px`, height: `${height}px`, transform: "none" },
        fontEmbedCSS: "",
        useCORS: true,
        cacheBust: true,
        filter: (node: Node) => {
          // Skip script and style tags
          if (node.nodeName === "SCRIPT" || node.nodeName === "STYLE") {
            return false;
          }
          return true;
        },
      });
      if (!blob) {
        console.warn("[shareAsImage] toBlob returned null");
        return;
      }
      const file = new File([blob], `receipt-${id}.png`, { type: "image/png" });
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Receipt", text: `Transaction ${id}` });
        if (!isMobile) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("[shareAsImage] error", err);
    } finally {
      setIsSharing(false);
      setShareOpen(false);
    }
  }

  async function shareAsPdf() {
    try {
      if (!receiptRef.current) {
        console.warn("[shareAsPdf] receiptRef is null");
        return;
      }
      setIsSharing(true);
      // Wait for state update to reflect in DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      const { toCanvas } = await import("html-to-image");
      const node = receiptRef.current;
      const width = node.scrollWidth;
      const pad = 48;
      const height = node.scrollHeight + pad;
      const canvas = await toCanvas(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width,
        height,
        style: { width: `${width}px`, height: `${height}px`, transform: "none" },
        fontEmbedCSS: "",
        useCORS: true,
        cacheBust: true,
        filter: (node: Node) => {
          // Skip script and style tags
          if (node.nodeName === "SCRIPT" || node.nodeName === "STYLE") {
            return false;
          }
          return true;
        },
      });
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        unit: "px",
        orientation: canvas.width >= canvas.height ? "l" : "p",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
      const blob = pdf.output("blob");
      const file = new File([blob], `receipt-${id}.pdf`, { type: "application/pdf" });
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Receipt", text: `Transaction ${id}` });
        if (!isMobile) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("[shareAsPdf] error", err);
    } finally {
      setIsSharing(false);
      setShareOpen(false);
    }
  }

  const [message, setMessage] = React.useState("");

  if (isLoading) {
    return (
      <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
        <AppHeader
          title="Transaction details"
          fixed
          left={
            <Link href="/home/transactions" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <ArrowLeftIcon size={18} color="#374151" />
            </Link>
          }
        />
        <div className="mt-6 text-center text-gray-500">Loading transaction...</div>
      </div>
    );
  }

  if (!parsedTx) {
    return (
      <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
        <AppHeader
          title="Transaction details"
          fixed
          left={
            <Link href="/home/transactions" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <ArrowLeftIcon size={18} color="#374151" />
            </Link>
          }
        />
        <div className="mt-6 text-center text-red-500">Transaction not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
      <AppHeader
        title="Transaction details"
        fixed
        left={
          <Link href="/home/transactions" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeftIcon size={18} color="#374151" />
          </Link>
        }
      />

      <div ref={receiptRef} className="mx-auto mt-6 w-full max-w-[560px] rounded-2xl bg-white p-4 text-left shadow relative overflow-hidden">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-[28px] font-semibold tracking-tight">
            <span>{amountParts.number}</span>
            {tokenLogo ? (
              <Image
                src={tokenLogo}
                alt={parsedTx?.tokenSymbol || "Token"}
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
                onError={(e) => {
                  // Hide logo if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : amountParts.symbol ? (
              <span>{amountParts.symbol}</span>
            ) : null}
            {amountParts.secondary && <span className="text-gray-500 text-[20px]">{amountParts.secondary}</span>}
          </div>
          <div
            className={
              `mt-2 inline-flex rounded-full px-3 py-1 text-[12px] ` +
              (status === "success"
                ? "bg-emerald-100 text-emerald-700"
                : status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700")
            }
          >
            {status === "success" ? "Success" : status === "pending" ? "Pending" : "Failed"}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <Row left="Transaction type" right={type === "borrow" ? "Money borrowed" : type === "repay" ? "Loan repaid" : type === "deposit" ? "Deposit" : type === "withdraw" ? "Withdraw" : type === "offramp" ? "Off-ramp" : "Swap"} />
          {(parsedTx.tokenSymbol || parsedTx.tokenAddress) && (
            <TokenRow
              left="Token"
              tokenSymbol={parsedTx.tokenSymbol}
              tokenAddress={parsedTx.tokenAddress}
              tokenLogo={tokenLogo}
            />
          )}
          {parsedTx.receiver && (
            <div className="flex items-start justify-between gap-4">
              <div className="text-[14px] font-medium text-gray-500">Bank account</div>
              <div className="text-right text-[14px] whitespace-pre-line">
                {parsedTx.receiver.name}
                {parsedTx.receiver.bankName && `\n${getBankNameByCode(parsedTx.receiver.bankName)}`}
                {parsedTx.receiver.accountNumber && `\n${parsedTx.receiver.accountNumber}`}
                {parsedTx.receiver.currency && `\n${parsedTx.receiver.currency}`}
              </div>
            </div>
          )}
          <Row left="Remark" right={parsedTx.remark} />
          {parsedTx.transactionNo && <Row left="Transaction No." right={parsedTx.transactionNo} />}
          <Row left="Transaction Hash" right={isSharing ? parsedTx.transactionHash : formatTransactionHash(parsedTx.transactionHash)} />
          {!isSharing && (
            <div className="flex justify-end">
              <CopyButton text={parsedTx.transactionHash} label="Copy hash" />
            </div>
          )}
          <Row left="Transaction date" right={date} />
          <Row left="Chain" right={parsedTx.walletType} />
        </div>

        {/* Watermark overlay (hidden for successful borrows) */}
        {!(type === "borrow" && status === "success") && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Image
              src="/logos/HODL_Neutral_Black.svg"
              alt=""
              width={360}
              height={120}
              className="opacity-10 select-none"
              priority
            />
          </div>
        )}
      </div>

      <div className="h-24" />

      <div className="fixed inset-x-0 z-10 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
        <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          {type === "borrow" && status !== "failed" ? (
            <div className="flex items-center gap-2">
              <Link href={`/repayments/${id}`} className="w-full rounded-[20px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white text-center">
                Repay loan
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-1/2 rounded-[20px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer"
                onClick={() => setReportOpen(true)}
              >
                Report issue
              </button>
              <button
                type="button"
                className="w-1/2 rounded-[20px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer"
                onClick={() => setShareOpen(true)}
              >
                Share receipt
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)}>
        <div className="space-y-4">
          <div className="text-[18px] font-semibold">Report issue</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] text-gray-600">
            <div>Transaction ID</div>
            <div className="text-right text-gray-900">{id}</div>
            <div>Amount</div>
            <div className="text-right text-gray-900">{amountString}</div>
            <div>Date</div>
            <div className="text-right text-gray-900">{date}</div>
          </div>
          <div>
            <label className="block text-[12px] text-gray-600">Describe the issue</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what went wrong..."
              className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-[14px] outline-none focus:border-gray-400"
              rows={4}
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="w-1/2 rounded-lg bg-gray-200 px-4 py-2 text-[14px]" onClick={() => setReportOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="w-1/2 rounded-lg bg-[#2200FF] px-4 py-2 text-[14px] text-white"
              onClick={() => {
                setReportOpen(false);
                setMessage("");
              }}
            >
              Submit report
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={shareOpen} onClose={() => setShareOpen(false)}>
        <div className="space-y-3">
          <div className="text-[18px] font-semibold">Share receipt</div>
          <div className="flex flex-col items-stretch gap-2">
            <button
              type="button"
              className="w-full rounded-lg bg-gray-200 px-4 py-2 text-[14px] cursor-pointer"
              onClick={shareAsImage}
            >
              Share as image
            </button>
            <button
              type="button"
              className="w-full rounded-lg bg-[#2200FF] px-4 py-2 text-[14px] text-white cursor-pointer"
              onClick={shareAsPdf}
            >
              Share as PDF
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
