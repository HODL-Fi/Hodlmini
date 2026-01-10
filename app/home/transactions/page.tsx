"use client";

export const dynamic = 'force-dynamic';

import { TransactionsList } from "@/components/transactions";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon } from "@customIcons";
import TransactionsFilterTrigger from "@/components/transactions/TransactionsFilterTrigger";
import React from "react";
import useGetUserTxHistory from "@/hooks/user/useGetUserTxHistory";
import { parseTransaction, ParsedTransaction } from "@/utils/transactions/parseTransaction";
import { formatTransactionAmountWithSign, formatTransactionTimestamp } from "@/utils/transactions/formatTransaction";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { useTokenMetadataBatch } from "@/hooks/prices/useTokenMetadata";
import { mapHexChainIdToDextools, makeDextoolsPriceKey } from "@/utils/prices/dextools";
import { useNgnConversion } from "@/hooks/useNgnConversion";
import { TransactionItemProps } from "@/components/transactions/TransactionItem";
import { LOCAL_TOKEN_ICONS } from "@/utils/constants/localTokenIcons";
import { CNGN_BASE_ADDRESS } from "@/utils/constants/cngn";
import { getWethAddressForChain } from "@/utils/constants/wethAddresses";

const LOCAL_ICONS = [...LOCAL_TOKEN_ICONS];

export default function HomeTransactionsPage() {
  const { data: transactions, isLoading, error } = useGetUserTxHistory();
  const { convertUsdToNgn } = useNgnConversion();

  // Collect unique token addresses for metadata fetching
  const tokenAddresses = React.useMemo(() => {
    if (!transactions) return [];
    const addresses = new Set<string>();
    transactions.forEach((tx) => {
      // Extract token address from remark
      const addressPattern = /0x[a-fA-F0-9]{40}/;
      const match = tx.remark.match(addressPattern);
      if (match) {
        addresses.add(match[0].toLowerCase());
      }
    });
    return Array.from(addresses);
  }, [transactions]);

  // Build price token requests for DEXTools
  const priceTokens = React.useMemo(() => {
    if (!transactions) return [];
    const tokens: { chain: ReturnType<typeof mapHexChainIdToDextools>; address: string }[] = [];
    const seen = new Set<string>();

    transactions.forEach((tx) => {
      const addressPattern = /0x[a-fA-F0-9]{40}/;
      const match = tx.remark.match(addressPattern);
      if (!match) return;

      const address = match[0].toLowerCase();
      const dextoolsChain = mapHexChainIdToDextools(tx.walletType);
      if (!dextoolsChain) return;

      // For Ether address, use WETH address for pricing
      let priceAddress = address;
      if (address === "0x0000000000000000000000000000000000000001") {
        const wethAddr = getWethAddressForChain(tx.walletType);
        if (!wethAddr) return; // Skip if no WETH address for this chain
        priceAddress = wethAddr.toLowerCase();
      }

      const key = `${dextoolsChain}-${priceAddress}`;
      if (seen.has(key)) return;
      seen.add(key);

      tokens.push({ chain: dextoolsChain, address: priceAddress });
    });

    return tokens;
  }, [transactions]);

  const { data: tokenPrices } = useTokenPrices(priceTokens as any);
  const { data: tokenMetadata } = useTokenMetadataBatch(priceTokens as any);

  // Parse transactions
  const parsedTransactions = React.useMemo<ParsedTransaction[]>(() => {
    if (!transactions) return [];

    return transactions.map((tx) => {
      // Extract token address
      const addressPattern = /0x[a-fA-F0-9]{40}/;
      const match = tx.remark.match(addressPattern);
      const tokenAddress = match ? match[0].toLowerCase() : null;

      // Get token metadata
      let metadata: { symbol?: string | null; decimals?: number | null; name?: string | null } = {};
      if (tokenAddress && tokenMetadata) {
        const dextoolsChain = mapHexChainIdToDextools(tx.walletType);
        if (dextoolsChain) {
          const priceKey = makeDextoolsPriceKey(dextoolsChain, tokenAddress);
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

      return parseTransaction(tx, metadata);
    });
  }, [transactions, tokenMetadata]);

  // Filter state
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(["borrow", "repay", "deposit", "withdraw", "swap", "offramp"]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>(["success", "pending", "failed"]);
  const [selectedRange, setSelectedRange] = React.useState<string | null>(null);

  // Filter transactions
  const filtered = React.useMemo(() => {
    let filtered = parsedTransactions;

    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((tx) => selectedTypes.includes(tx.type));
    }

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((tx) => selectedStatuses.includes(tx.status));
    }

    // Filter by date range
    if (selectedRange) {
      const now = new Date();
      let cutoffDate: Date;

      switch (selectedRange) {
        case "Last 24hrs":
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "Last 7 days":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "Last 30 days":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "Last 90 days":
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "Last 360 days":
          cutoffDate = new Date(now.getTime() - 360 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter((tx) => new Date(tx.createdAt) >= cutoffDate);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [parsedTransactions, selectedTypes, selectedStatuses, selectedRange]);

  // Convert to TransactionItemProps format
  const transactionItems = React.useMemo<TransactionItemProps[]>(() => {
    return filtered.map((tx) => {
      // Get token price and logo
      let tokenPriceUsd = 0;
      let tokenLogo: string | undefined = undefined;
      if (tx.tokenAddress) {
        // Check local token icons first (by symbol)
        if (tx.tokenSymbol) {
          const symbolLower = tx.tokenSymbol.toLowerCase();
          if (LOCAL_ICONS.includes(symbolLower)) {
            tokenLogo = `/assets/${symbolLower}.svg`;
          }
        }

        // Check Ether by address
        if (!tokenLogo) {
          const normalizedAddr = tx.tokenAddress.toLowerCase();
          const etherAddr = "0x0000000000000000000000000000000000000001";
          if (normalizedAddr === etherAddr) {
            // Check if eth.svg exists in local icons, otherwise use a default
            if (LOCAL_ICONS.includes("eth")) {
              tokenLogo = "/assets/eth.svg";
            }
          }
        }

        // Check cNGN by address if symbol didn't match
        if (!tokenLogo) {
          const normalizedAddr = tx.tokenAddress.toLowerCase();
          const cngnAddr = CNGN_BASE_ADDRESS.toLowerCase();
          if (normalizedAddr === cngnAddr || normalizedAddr === `0x${cngnAddr}`) {
            tokenLogo = "/assets/cngn.svg";
          }
        }

        // Then try DEXTools metadata
        if (!tokenLogo && tokenMetadata) {
          const dextoolsChain = mapHexChainIdToDextools(tx.walletType);
          if (dextoolsChain) {
            const priceKey = makeDextoolsPriceKey(dextoolsChain, tx.tokenAddress);
            const meta = tokenMetadata[priceKey];
            if (meta?.logo) {
              tokenLogo = meta.logo;
            }
          }
        }

        // Get token price
        if (tokenPrices) {
          const dextoolsChain = mapHexChainIdToDextools(tx.walletType);
          if (dextoolsChain) {
            // For Ether address, use WETH address for price lookup
            let priceAddress = tx.tokenAddress;
            if (tx.tokenAddress?.toLowerCase() === "0x0000000000000000000000000000000000000001") {
              const wethAddr = getWethAddressForChain(tx.walletType);
              if (wethAddr) {
                priceAddress = wethAddr.toLowerCase();
              }
            }
            const priceKey = makeDextoolsPriceKey(dextoolsChain, priceAddress);
            tokenPriceUsd = tokenPrices[priceKey]?.price ?? 0;
          }
        }
      }

      const amount = formatTransactionAmountWithSign(tx, tokenPriceUsd, convertUsdToNgn);
      const timestamp = formatTransactionTimestamp(tx.createdAt);

      // Set title for offramp transactions
      const title = tx.type === "offramp" ? "Off-ramp" : undefined;

      return {
        id: tx.id,
        type: tx.type,
        title,
        amount,
        timestamp,
        status: tx.status,
        tokenLogo: tokenLogo, // Token logo for amount area
        href: `/home/transactions/${tx.id}?type=${tx.type}&status=${tx.status}`,
      };
    });
  }, [filtered, tokenPrices, tokenMetadata, convertUsdToNgn]);

  if (isLoading) {
    return (
      <div className="min-h-dvh px-3 text-left">
        <AppHeader
          title="Transactions"
          left={
            <Link href="/home" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <ArrowLeftIcon size={18} color="#374151" />
            </Link>
          }
        />
        <div className="mt-3 text-center text-gray-500">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh px-3 text-left">
        <AppHeader
          title="Transactions"
          left={
            <Link href="/home" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <ArrowLeftIcon size={18} color="#374151" />
            </Link>
          }
        />
        <div className="mt-3 text-center text-red-500">Error loading transactions. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-3 text-left">
      <AppHeader
        title="Transactions"
        left={
          <Link href="/home" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeftIcon size={18} color="#374151" />
          </Link>
        }
        right={
          <TransactionsFilterTrigger
            onApply={({ types, statuses, range }) => {
              setSelectedTypes(types);
              setSelectedStatuses(statuses);
              setSelectedRange(range);
            }}
            defaultTypes={selectedTypes}
            defaultStatuses={selectedStatuses}
            defaultRange={selectedRange}
          />
        }
      />
      <div className="mt-3">
        {transactionItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-[16px] border border-gray-200 bg-white">
            <Image 
              src="/icons/sad.svg" 
              alt="No transactions" 
              width={72} 
              height={72} 
              className="mb-4"
            />
            <div className="text-[16px] font-semibold text-gray-900">No Transactions</div>
            <div className="text-[12px] text-gray-600 mt-1 text-center">
              You don't have any transactions yet.
            </div>
          </div>
        ) : (
          <TransactionsList
            title=""
            items={transactionItems}
          />
        )}
      </div>
    </div>
  );
}
