import { TokenBalance } from "@/hooks/wallet/useGetTokenWalletBalance";
import { DextoolsChainId } from "@/utils/prices/dextoolsChains";

const MANTLE_CHAIN_ID = "0x1388";
const MANTLE_NATIVE_TOKEN_PLACEHOLDER = "0x0000000000000000000000000000000000000001";
const MNT_PRICE_ADDRESS = "0x3c3a81e81dc49a522a592e7622a7e711c06bf354";
const MNT_PRICE_CHAIN: DextoolsChainId = "ether"; // Query from Ethereum chain

/**
 * Normalizes Mantle native token from incorrect ETH representation to MNT
 * This is a frontend workaround until the backend fixes the API response
 */
export function normalizeMantleNativeToken(
  hexChainId: string,
  token: TokenBalance
): TokenBalance {
  // Check if this is Mantle chain and the token is the incorrectly labeled ETH native token
  if (
    hexChainId === MANTLE_CHAIN_ID &&
    token.symbol.toUpperCase() === "ETH" &&
    token.contractAddress === MANTLE_NATIVE_TOKEN_PLACEHOLDER
  ) {
    return {
      ...token,
      name: "Mantle",
      symbol: "MNT",
      logo: "/chains/mantle.svg", // Explicitly set the logo path
    };
  }
  return token;
}

/**
 * Gets the price lookup address and chain for a token
 * For Mantle native token (MNT), returns Ethereum chain with the MNT contract address
 * Handles both cases: when backend returns ETH (incorrect) or MNT (correct)
 */
export function getPriceLookupInfo(
  hexChainId: string,
  token: TokenBalance
): { address: string; chain: DextoolsChainId } | null {
  // Check if this is Mantle chain
  if (hexChainId !== MANTLE_CHAIN_ID) return null;
  
  const symbolUpper = token.symbol.toUpperCase();
  const isPlaceholderAddress = token.contractAddress === MANTLE_NATIVE_TOKEN_PLACEHOLDER;
  
  // Handle both cases: backend returning ETH (incorrect) or MNT (correct)
  const isMantleNativeToken = 
    (symbolUpper === "ETH" || symbolUpper === "MNT") && 
    isPlaceholderAddress;
  
  if (isMantleNativeToken) {
    return {
      address: MNT_PRICE_ADDRESS,
      chain: MNT_PRICE_CHAIN,
    };
  }
  
  return null;
}
