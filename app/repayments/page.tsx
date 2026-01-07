"use client";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import React from "react";
import { TransactionsList } from "@/components/transactions";
import { ArrowLeftIcon } from "@customIcons";
import useGetActiveLoanPositions from "@/hooks/vault/useGetActiveLoanPositions";
import { CHAIN_IDS } from "@/utils/constants/chainIds";
import { useNgnConversion } from "@/hooks/useNgnConversion";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { mapHexChainIdToDextools, makeDextoolsPriceKey } from "@/utils/prices/dextools";
import { useTokenMetadataBatch } from "@/hooks/prices/useTokenMetadata";
import { CNGN_BASE_ADDRESS, CNGN_DECIMALS } from "@/utils/constants/cngn";
import { getTokenDecimals } from "@/utils/constants/tokenDecimals";

export default function RepaymentsPage() {
  const chainList = React.useMemo(() => Object.values(CHAIN_IDS), []);
  const { data: activeLoansByChain } = useGetActiveLoanPositions(chainList);
  const { convertUsdToNgn } = useNgnConversion();

  // Collect unique token addresses
  const uniqueTokenAddresses = React.useMemo(() => {
    if (!activeLoansByChain) return [];
    const addresses = new Set<string>();
    Object.values(activeLoansByChain).forEach((loans) => {
      loans.forEach((loan) => {
        if (loan.token) {
          addresses.add(loan.token.toLowerCase());
        }
      });
    });
    return Array.from(addresses);
  }, [activeLoansByChain]);

  // Build price token requests for DEXTools
  const priceTokens = React.useMemo(() => {
    if (!activeLoansByChain) return [];
    
    const seen = new Set<string>();
    const tokens: { chain: ReturnType<typeof mapHexChainIdToDextools>; address: string }[] = [];

    Object.entries(activeLoansByChain).forEach(([hexChainId, loans]) => {
      const dextoolsChain = mapHexChainIdToDextools(hexChainId);
      if (!dextoolsChain) return;

      loans.forEach((loan) => {
        if (!loan.token) return;
        const addr = loan.token.toLowerCase();
        const key = makeDextoolsPriceKey(dextoolsChain, addr);
        
        if (seen.has(key)) return;
        seen.add(key);

        tokens.push({ chain: dextoolsChain, address: addr });
      });
    });

    return tokens;
  }, [activeLoansByChain]);

  const { data: tokenPrices } = useTokenPrices(priceTokens as any);

  // Fetch token metadata (decimals, symbol, name) from DEXTools
  const { data: tokenMetadata } = useTokenMetadataBatch(priceTokens as any);

  // Build a map of token address -> token details from DEXTools metadata
  const tokenDetailsMap = React.useMemo(() => {
    const map = new Map<string, { decimals: number; symbol: string; name: string }>();
    
    // Known token constants (fallback if DEXTools doesn't have metadata)
    const knownTokens: Record<string, { decimals: number; symbol: string; name: string }> = {
      [CNGN_BASE_ADDRESS.toLowerCase()]: {
        decimals: CNGN_DECIMALS,
        symbol: "cNGN",
        name: "cNGN",
      },
    };

    Object.entries(activeLoansByChain || {}).forEach(([chainId, loans]) => {
      const dextoolsChain = mapHexChainIdToDextools(chainId);

      loans.forEach((loan) => {
        if (!loan.token) return;
        const tokenAddress = loan.token.toLowerCase();
        
        // Try DEXTools metadata first
        let metadataDecimals: number | null = null;
        let metadataSymbol: string | null = null;
        let metadataName: string | null = null;
        
        if (tokenMetadata && dextoolsChain) {
          const priceKey = makeDextoolsPriceKey(dextoolsChain, tokenAddress);
          const dextoolsMeta = tokenMetadata[priceKey];
          if (dextoolsMeta) {
            metadataDecimals = dextoolsMeta.decimals ?? null;
            metadataSymbol = dextoolsMeta.symbol ?? null;
            metadataName = dextoolsMeta.name ?? null;
          }
        }
        
        // Use getTokenDecimals with fallback chain: API -> known by symbol -> known by address -> 18
        const decimals = getTokenDecimals(metadataDecimals, metadataSymbol, tokenAddress);
        
        // Fallback to known tokens for symbol/name, then default
        const knownToken = knownTokens[tokenAddress];
        const metadata = {
          decimals,
          symbol: metadataSymbol ?? knownToken?.symbol ?? "TOKEN",
          name: metadataName ?? knownToken?.name ?? "Token",
        };
        
        map.set(tokenAddress, metadata);
      });
    });
    
    return map;
  }, [tokenMetadata, activeLoansByChain]);

  // Normalize amount from smallest units using correct decimals
  function normalizeAmount(raw: string | number, decimals: number): number {
    const n = Number(raw) || 0;
    if (!Number.isFinite(n)) return 0;
    // Always divide by decimals for amounts from blockchain
    return n / (10 ** decimals);
  }

  // Format timestamp
  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${day} ${month} at ${displayHours}:${displayMinutes}${ampm}`;
  }

  // Format amount in NGN
  function formatNgn(amount: number): string {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }

  // Check if token metadata is still loading
  const tokenDetailsLoading = React.useMemo(() => {
    // We can't easily check loading state from useTokenMetadataBatch, so we'll just check if metadata exists
    return false; // Will show loans even if metadata is loading
  }, []);

  // Process active loans into transaction items with accurate token details and prices
  const loanItems = React.useMemo(() => {
    if (!activeLoansByChain) return [];

    const items: Array<{
      id: string;
      type: "borrow";
      amount: string;
      timestamp: string;
      status: "pending";
      loanId: number;
      positionId: number;
      token: string;
      debt: number;
      principal: number;
      repaid: number;
      chainId: string;
      tokenSymbol: string;
    }> = [];

    Object.entries(activeLoansByChain).forEach(([chainId, loans]) => {
      const dextoolsChain = mapHexChainIdToDextools(chainId);

      loans.forEach((loan) => {
        if (!loan.token) return;
        
        const tokenAddress = loan.token.toLowerCase();
        const tokenDetails = tokenDetailsMap.get(tokenAddress);
        const decimals = tokenDetails?.decimals ?? getTokenDecimals(null, null, tokenAddress);
        const tokenSymbol = tokenDetails?.symbol ?? "TOKEN";

        // Normalize amounts using correct decimals
        const debtAmount = normalizeAmount(loan.debt, decimals);
        const principalAmount = normalizeAmount(loan.principal, decimals);
        const repaidAmount = normalizeAmount(loan.repaid, decimals);

        // Get token price from DEXTools (may not be loaded yet or chain not supported)
        let debtNgn = 0;
        let hasPrice = false;
        if (tokenPrices && dextoolsChain) {
          const priceKey = makeDextoolsPriceKey(dextoolsChain, tokenAddress);
          const priceData = tokenPrices[priceKey];
          const tokenPriceUsd = priceData?.price ?? 0;

          // Convert debt to USD, then to NGN
          if (tokenPriceUsd > 0) {
            hasPrice = true;
            const debtUsd = debtAmount * tokenPriceUsd;
            debtNgn = convertUsdToNgn(debtUsd);
          }
        }

        // Format display amount
        let displayAmount: string;
        if (hasPrice && debtNgn > 0) {
          displayAmount = `-${formatNgn(debtNgn)}`;
        } else if (debtAmount > 0) {
          // Show token amount as fallback
          const formattedTokenAmount = debtAmount >= 1
            ? debtAmount.toFixed(2)
            : debtAmount >= 0.01
            ? debtAmount.toFixed(4)
            : debtAmount.toFixed(6);
          displayAmount = `-${formattedTokenAmount} ${tokenSymbol}`;
        } else {
          displayAmount = "-₦0.00";
        }
        
        // Status: 1 = active/pending
        const status = loan.status === 1 ? "pending" : "pending";
        
        items.push({
          id: `loan-${loan.loanId}-${chainId}`,
          type: "borrow",
          amount: displayAmount,
          timestamp: formatTimestamp(loan.startTimestamp),
          status,
          loanId: loan.loanId,
          positionId: loan.positionId,
          token: loan.token,
          debt: debtAmount,
          principal: principalAmount,
          repaid: repaidAmount,
          chainId,
          tokenSymbol,
        });
      });
    });

    // Sort by timestamp (newest first)
    return items.sort((a, b) => {
      const loanA = activeLoansByChain[a.chainId]?.find((l) => l.loanId === a.loanId);
      const loanB = activeLoansByChain[b.chainId]?.find((l) => l.loanId === b.loanId);
      const timestampA = loanA?.startTimestamp || 0;
      const timestampB = loanB?.startTimestamp || 0;
      return timestampB - timestampA;
    });
  }, [activeLoansByChain, tokenPrices, tokenDetailsMap, convertUsdToNgn]);

  return (
    <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
      <AppHeader
        title="Repayments"
        fixed
        left={
          <Link href="/home" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeftIcon size={18} color="#374151" />
          </Link>
        }
      />

      <div className="mt-3">
        {tokenDetailsLoading ? (
          <div className="rounded-[16px] border border-gray-200 bg-white p-6 text-center">
            <div className="text-[16px] font-medium text-gray-600">Loading loan details...</div>
          </div>
        ) : loanItems.length > 0 ? (
          <TransactionsList
            title="Active loans"
            items={loanItems.map((it) => ({
              id: it.id,
              type: it.type,
              amount: it.amount,
              timestamp: it.timestamp,
              status: it.status,
              href: `/repayments/${it.loanId}?chainId=${it.chainId}&positionId=${it.positionId}`,
            }))}
          />
        ) : (
          <div className="rounded-[16px] border border-gray-200 bg-white p-6 text-center">
            <div className="text-[16px] font-medium text-gray-600">No active loans</div>
            <div className="mt-2 text-[14px] text-gray-500">You don't have any loans to repay at the moment.</div>
          </div>
        )}
      </div>
    </div>
  );
}
