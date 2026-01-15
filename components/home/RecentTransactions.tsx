"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TransactionsList } from "@/components/transactions";
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

export default function RecentTransactions() {
  const { data: transactions, isLoading } = useGetUserTxHistory();
  const { convertUsdToNgn } = useNgnConversion();

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

  // Get recent transactions (last 5, sorted by date)
  const recentTransactions = React.useMemo(() => {
    return parsedTransactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [parsedTransactions]);

  // Convert to TransactionItemProps format
  const transactionItems = React.useMemo<TransactionItemProps[]>(() => {
    return recentTransactions.map((tx) => {
      // Get token price and logo
      let tokenPriceUsd = 0;
      let tokenLogo: string | undefined = undefined;
      if (tx.tokenAddress) {
        // Check local token icons first (by symbol)
        if (tx.tokenSymbol) {
          const symbolLower = tx.tokenSymbol.toLowerCase();
          // Special case: MNT should use Mantle chain logo
          if (symbolLower === "mnt") {
            tokenLogo = "/chains/mantle.svg";
          } else if (LOCAL_ICONS.includes(symbolLower)) {
            tokenLogo = `/assets/${symbolLower}.svg`;
          }
        }

        // Check Mantle native token (MNT) by address and chain
        if (!tokenLogo) {
          const normalizedAddr = tx.tokenAddress.toLowerCase();
          const etherAddr = "0x0000000000000000000000000000000000000001";
          const isMantleChain = tx.walletType?.toLowerCase().includes("mantle");
          if (isMantleChain && normalizedAddr === etherAddr) {
            tokenLogo = "/chains/mantle.svg";
          }
        }

        // Check Ether by address (only if not Mantle)
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

      return {
        id: tx.id,
        type: tx.type,
        amount,
        timestamp,
        status: tx.status,
        tokenLogo: tokenLogo, // Token logo for amount area
        href: `/home/transactions/${tx.id}?type=${tx.type}&status=${tx.status}`,
      };
    });
  }, [recentTransactions, tokenPrices, tokenMetadata, convertUsdToNgn]);

  if (isLoading) {
    return (
      <TransactionsList
        title="Transactions"
        viewAllHref="/home/transactions"
        items={[]}
      />
    );
  }

  if (transactionItems.length === 0) {
    return (
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold leading-6">Transactions</h2>
          <Link href="/home/transactions" className="text-[14px] underline underline-offset-2 text-gray-700">
            View all
          </Link>
        </div>
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
      </section>
    );
  }

  return (
    <TransactionsList
      title="Transactions"
      viewAllHref="/home/transactions"
      items={transactionItems}
    />
  );
}

