import { DEXTOOLS_CHAINS, DextoolsChainId } from "@/utils/prices/dextoolsChains";
import { CHAIN_IDS } from "./chainIds";

// WETH contract addresses per chain (for pricing ETH since ETH has no contract address)
export const WETH_ADDRESSES: Record<DextoolsChainId, string> = {
  ether: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // Ethereum mainnet WETH
  bsc: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // BSC WETH
  base: "0x4200000000000000000000000000000000000006", // Base WETH
};

// Helper to get WETH address for a hex chainId
export const getWethAddressForChain = (hexChainId: string): string | undefined => {
  // Map hex chainId to Dextools chain, then get WETH address
  const dextoolsChain = DEXTOOLS_CHAINS[hexChainId];
  return dextoolsChain ? WETH_ADDRESSES[dextoolsChain] : undefined;
};

