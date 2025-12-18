import { useMemo } from "react";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { makeDextoolsPriceKey } from "@/utils/prices/dextools";

// cNGN contract address on BSC
const CNGN_BSC_ADDRESS = "0xa8aea66b361a8d53e8865c62d142167af28af058";

export const useNgnConversion = () => {
  // Fetch cNGN price from DEXTools
  const { data: prices, isLoading, error } = useTokenPrices([
    { chain: "bsc", address: CNGN_BSC_ADDRESS },
  ]);

  const cngnPriceKey = useMemo(
    () => makeDextoolsPriceKey("bsc", CNGN_BSC_ADDRESS),
    []
  );

  const cngnPrice = prices?.[cngnPriceKey]?.price ?? 0;

  // Conversion rate: if 1 cNGN = $X, then 1 USD = 1/X NGN
  const usdToNgnRate = useMemo(() => {
    if (cngnPrice <= 0) return 0;
    return 1 / cngnPrice;
  }, [cngnPrice]);

  const convertUsdToNgn = useMemo(
    () => (usdAmount: number) => {
      if (usdToNgnRate <= 0) return 0;
      return usdAmount * usdToNgnRate;
    },
    [usdToNgnRate]
  );

  return {
    convertUsdToNgn,
    usdToNgnRate,
    cngnPrice,
    isLoading,
    error,
  };
};

