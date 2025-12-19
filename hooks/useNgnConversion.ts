import { useMemo } from "react";

// For now, treat cNGN as pegged 1:1 to NGN and use a fixed USD price
// based on the DEXTools sample you provided:
//   1 cNGN ≈ 0.0006781026816586713 USD
const CNGN_PRICE_USD = 0.0006781026816586713;

export const useNgnConversion = () => {
  const cngnPrice = CNGN_PRICE_USD;

  const usdToNgnRate = useMemo(() => {
    // If 1 cNGN = $X, and 1 cNGN ~= 1 NGN, then 1 USD = 1 / X NGN.
    if (cngnPrice <= 0) return 0;
    return 1 / cngnPrice;
  }, []);

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
    isLoading: false,
    error: null as unknown as Error | null,
  };
};


