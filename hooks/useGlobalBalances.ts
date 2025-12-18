import { useMemo } from "react";
import useGetAccountValue from "@/hooks/vault/useGetAccountValue";
import { useGetAllChainBalances } from "@/hooks/wallet/useGetTokenWalletBalance";
import { CHAIN_IDS } from "@/utils/constants/chainIds";
import { mapHexChainIdToDextools, makeDextoolsPriceKey } from "@/utils/prices/dextools";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { getWethAddressForChain } from "@/utils/constants/wethAddresses";

// Exposed shape for top-level balances (wallet strip, etc.)
export interface GlobalBalances {
  walletUsd: number;
  loanUsd: number;          // debtValue
  collateralUsd: number;    // collateralValue
  availableToBorrowUsd: number;
}

function normalizeAccountMetric(raw: number | string | undefined): number {
  const n = Number(raw) || 0;
  if (!Number.isFinite(n)) return 0;
  // If the value looks like a 1e18-scaled integer, normalise it.
  if (n > 1e12) {
    return n / 1e18;
  }
  return n;
}

export const useGlobalBalances = () => {
  // 1) Lending account values (collateral / debt / available)
  // Fetch for all chains to get global totals
  const chainList = useMemo(() => Object.values(CHAIN_IDS), []);
  const { data: accountValueByChain } = useGetAccountValue(chainList);
  
  // Sum account values across all chains
  const accountValue = useMemo(() => {
    if (!accountValueByChain) return null;
    
    let totalCollateral = 0;
    let totalDebt = 0;
    let totalAvailable = 0;
    
    Object.values(accountValueByChain).forEach((value) => {
      totalCollateral += normalizeAccountMetric(value.collateralValue);
      totalDebt += normalizeAccountMetric(value.debtValue);
      totalAvailable += normalizeAccountMetric(value.availableToBorrow);
    });
    
    return {
      collateralValue: totalCollateral,
      debtValue: totalDebt,
      availableToBorrow: totalAvailable,
    };
  }, [accountValueByChain]);

  // 2) Wallet balances + prices to compute walletUsd
  const { data: balancesByChain } = useGetAllChainBalances(chainList);

  const priceTokens = useMemo(() => {
    if (!balancesByChain) return [];

    const seen = new Set<string>();
    const tokens: { chain: ReturnType<typeof mapHexChainIdToDextools>; address: string }[] = [];

    Object.entries(balancesByChain).forEach(([hexChainId, chainBalances]) => {
      const dextoolsChain = mapHexChainIdToDextools(hexChainId);
      if (!dextoolsChain) return;

      chainBalances.forEach((token) => {
        let addr = token.contractAddress;
        
        // For ETH (native token with no contract or placeholder address), use WETH address for pricing
        const isEthNative = token.symbol.toUpperCase() === "ETH" && 
          (!addr || addr === "N/A" || addr === "0x0000000000000000000000000000000000000001");
        
        if (isEthNative) {
          const wethAddr = getWethAddressForChain(hexChainId);
          if (wethAddr) {
            addr = wethAddr;
          } else {
            return; // No WETH address for this chain, skip
          }
        } else if (!addr || addr === "N/A") {
          return; // skip other native / non-contract tokens
        }

        const key = makeDextoolsPriceKey(dextoolsChain, addr);
        if (seen.has(key)) return;
        seen.add(key);

        tokens.push({ chain: dextoolsChain, address: addr });
      });
    });

    return tokens;
  }, [balancesByChain]);

  const { data: tokenPrices } = useTokenPrices(priceTokens as any);

  const walletUsd = useMemo(() => {
    if (!balancesByChain || !tokenPrices) return 0;

    let total = 0;

    Object.entries(balancesByChain).forEach(([hexChainId, chainBalances]) => {
      const dextoolsChain = mapHexChainIdToDextools(hexChainId);
      if (!dextoolsChain) return;

      chainBalances.forEach((token) => {
        const amount = Number(token.balance) || 0;
        let priceAddress = token.contractAddress;
        
        // Use WETH address for ETH tokens (native token has no contract or placeholder address)
        const isEthNative = token.symbol.toUpperCase() === "ETH" && 
          (!priceAddress || priceAddress === "N/A" || priceAddress === "0x0000000000000000000000000000000000000001");
        
        if (isEthNative) {
          const wethAddr = getWethAddressForChain(hexChainId);
          if (wethAddr) {
            priceAddress = wethAddr;
          } else {
            return; // No WETH address for this chain, skip
          }
        } else if (!priceAddress || priceAddress === "N/A") {
          return; // skip other native / non-contract tokens
        }

        const key = makeDextoolsPriceKey(dextoolsChain, priceAddress);
        const p = (tokenPrices as any)[key];
        const price = p?.price ?? 0;
        total += amount * price;
      });
    });

    return total;
  }, [balancesByChain, tokenPrices]);

  const loanUsd = accountValue?.debtValue ?? 0;
  const collateralUsd = accountValue?.collateralValue ?? 0;
  const availableToBorrowUsd = accountValue?.availableToBorrow ?? 0;

  const data: GlobalBalances = {
    walletUsd,
    loanUsd,
    collateralUsd,
    availableToBorrowUsd,
  };

  return { data };
};


