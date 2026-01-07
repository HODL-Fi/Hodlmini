import { CHAIN_IDS } from "@/utils/constants/chainIds";

// DEXTools chain identifiers (spec uses strings like "ether" for Ethereum)
export type DextoolsChainId = "ether" | "bsc" | "base";

// Map our hex chainIds (from CHAIN_IDS) to DEXTools chain ids
// NOTE: Right now only TEST is active in CHAIN_IDS, and it mocks Base mainnet,
// so it uses "base" for DEXTools. When we re-enable other chains in CHAIN_IDS,
// we can extend this map accordingly.
export const DEXTOOLS_CHAINS: Record<string, DextoolsChainId> = {
  [CHAIN_IDS.TEST]: "base",
  // [CHAIN_IDS.ETH]: "ether",
  // [CHAIN_IDS.BSC]: "bsc",
  // [CHAIN_IDS.BASE]: "base",
};


