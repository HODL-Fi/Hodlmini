/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export const dynamic = 'force-dynamic';

import React from "react";
import { VisibilityProvider } from "@/components/visibility";
import BorrowTopNav from "@/components/BorrowTopNav";
import { AccountsScroller } from "@/components/accounts";
import GlobalAccountsScroller from "@/components/accounts/GlobalAccountsScroller";
import BalanceRow from "@/components/BalanceRow";
import { QuickActions } from "@/components/quickActions";
import { WalletIcon, VaultIcon } from "@customIcons";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { CHAIN_IDS } from "@/utils/constants/chainIds";
import { LOCAL_TOKEN_ICONS } from "@/utils/constants/localTokenIcons";
import useGetTokenWalletBalance, { TokenBalance, useGetAllChainBalances } from "@/hooks/wallet/useGetTokenWalletBalance";
import { useTokenMetadataBatch } from "@/hooks/prices/useTokenMetadata";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { mapHexChainIdToDextools, makeDextoolsPriceKey } from "@/utils/prices/dextools";
import { getWethAddressForChain } from "@/utils/constants/wethAddresses";

export default function WalletPage() {
  // Supported chains - only include chains that exist in CHAIN_IDS
  const CHAINS = React.useMemo(() => {
    const allChains = [
      { key: "ALL", name: "All networks", icon: "/icons/globe-alt.svg" },
      { key: "ETH", name: "Ethereum", icon: "/chains/ethereum.svg" },
      { key: "BSC", name: "BNB Smart Chain", icon: "/chains/bsc.svg" },
      { key: "LSK", name: "Lisk", icon: "/chains/lisk.svg" },
      { key: "BASE", name: "Base", icon: "/chains/base.svg" },
      { key: "TEST", name: "Test Network", icon: "/chains/test.svg" },
    ];
    
    // Filter to only include chains that are in CHAIN_IDS (plus "ALL")
    return allChains.filter(chain => chain.key === "ALL" || chain.key in CHAIN_IDS);
  }, []);

  type ChainKey = "ALL" | "ETH" | "BSC" | "LSK" | "BASE" | "TEST";
  type AssetItem = {
    symbol: string;
    name: string;
    icon: string;
    supported: ChainKey[]; // chains where asset is available
    balances: Partial<Record<ChainKey, number>>; // per-network amounts
    price: number; // usd
    changePct: number; // 24h %
  };

  // Available local icons
  const LOCAL_ICONS = React.useMemo(
    () => [...LOCAL_TOKEN_ICONS],
    []
  );
  
  // Helper to get icon - prefer local, fallback to API logo, then DEXTools, then placeholder
  const getAssetIcon = (
    symbol: string, 
    apiLogo: string | null, 
    contractAddress: string | null,
    dextoolsLogo: string | null
  ): string => {
    const symbolLower = symbol.toLowerCase();
    if (LOCAL_ICONS.includes(symbolLower)) {
      return `/assets/${symbolLower}.svg`;
    }
    if (apiLogo) {
      return apiLogo;
    }
    if (dextoolsLogo) {
      return dextoolsLogo;
    }
    // Placeholder - return null to use the fallback UI component
    return '';
  };

  

  const ASSETS: AssetItem[] = React.useMemo(() => ([
    { symbol: "ETH",  name: "Ethereum",  icon: "/assets/eth.svg",  supported: ["ETH","BSC","LSK","BASE"], balances: { },  price: 0, changePct: 0 },
    { symbol: "USDT", name: "Tether",    icon: "/assets/usdt.svg", supported: ["ETH","BSC","LSK","BASE"], balances: { },   price: 0,     changePct: 0 },
    { symbol: "USDC", name: "USD Coin",  icon: "/assets/usdc.svg", supported: ["ETH","BSC","LSK","BASE"], balances: { }, price: 0,     changePct: 0 },
    { symbol: "DAI",  name: "DAI",       icon: "/assets/dai.svg",  supported: ["ETH","BSC","LSK","BASE"], balances: { },      price: 0,     changePct: 0 },
    { symbol: "WETH", name: "Wrapped ETH", icon: "/assets/weth.svg", supported: ["ETH","BSC","LSK","BASE"], balances: { },   price: 0, changePct: 0 },
    { symbol: "BNB",  name: "BNB",       icon: "/assets/bnb.svg",  supported: ["ETH","BSC","LSK","BASE"], balances: { },      price: 0,  changePct: 0 },
    { symbol: "WKC",  name: "Wikicat",   icon: "/assets/wkc.svg",  supported: ["BSC"],                         balances: { },      price: 0, changePct: 0 },
    { symbol: "cNGN", name: "compliant NGN", icon: "/assets/cngn.svg", supported: ["BASE","ETH","BSC"], balances: { }, price: 0, changePct: 0 },
  ]), []);

  const [selectedChain, setSelectedChain] = React.useState<ChainKey>("ALL");
  const [networkModalOpen, setNetworkModalOpen] = React.useState(false);

  // When selectedChain !== "ALL" you simply call:
  const chainId = selectedChain === "ALL" ? undefined : CHAIN_IDS[selectedChain as keyof typeof CHAIN_IDS];
  const { data: chainData } = useGetTokenWalletBalance(chainId!);


  const chainList = Object.values(CHAIN_IDS);
  const { data: balancesByChain, isSuccess, isLoading } = useGetAllChainBalances(chainList);

  // Build DEXTools price requests from balances
  const priceTokens = React.useMemo(() => {
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

  // Build DEXTools metadata requests for tokens without local icons
  const metadataTokens = React.useMemo(() => {
    if (!balancesByChain) return [];

    const seen = new Set<string>();
    const tokens: { chain: ReturnType<typeof mapHexChainIdToDextools>; address: string }[] = [];

    Object.entries(balancesByChain).forEach(([hexChainId, chainBalances]) => {
      const dextoolsChain = mapHexChainIdToDextools(hexChainId);
      if (!dextoolsChain) return;

      chainBalances.forEach((token) => {
        const symbolLower = token.symbol.toLowerCase();
        // Skip if we have a local icon
        if (LOCAL_ICONS.includes(symbolLower)) return;
        
        const addr = token.contractAddress;
        if (!addr || addr === "N/A") return; // skip native / non-contract tokens
        // Skip if API already provided a logo
        if (token.logo) return;

        const key = makeDextoolsPriceKey(dextoolsChain, addr);
        if (seen.has(key)) return;
        seen.add(key);

        tokens.push({ chain: dextoolsChain, address: addr });
      });
    });

    return tokens;
  }, [balancesByChain]);

  const { data: tokenMetadata } = useTokenMetadataBatch(metadataTokens as any);

  // Map chainId (hex) to ChainKey
  const chainIdToKey = React.useMemo(() => {
    const map: Record<string, ChainKey> = {};
    (Object.entries(CHAIN_IDS) as [ChainKey, string][]).forEach(([key, chainId]) => {
      map[chainId] = key;
    });
    return map;
  }, []);

  // Build assets from API data - keep tokens separate per chain
  const assetsFromAPI = React.useMemo(() => {
    if (!balancesByChain) {
      return [];
    }

    const assets: (AssetItem & { chainKey: ChainKey })[] = [];

    // Process each chain's balances - keep tokens separate per chain
    Object.entries(balancesByChain).forEach(([chainId, chainBalances]) => {
      const chainKey = chainIdToKey[chainId];
      if (!chainKey) {
        return;
      }

      chainBalances.forEach((token) => {
        const amount = Number(token.balance);

        // Look up price from DEXTools if we have a contract address + mapping
        // For ETH (native token), use WETH address for pricing
        let price = 0;
        let changePct = 0;
        const dextoolsChain = mapHexChainIdToDextools(chainId);
        if (dextoolsChain && tokenPrices) {
          let priceAddress = token.contractAddress;
          
          // Use WETH address for ETH tokens (native token has no contract or placeholder address)
          const isEthNative = token.symbol.toUpperCase() === "ETH" && 
            (!priceAddress || priceAddress === "N/A" || priceAddress === "0x0000000000000000000000000000000000000001");
          
          if (isEthNative) {
            const wethAddr = getWethAddressForChain(chainId);
            if (wethAddr) {
              priceAddress = wethAddr;
            }
          }
          
          if (priceAddress && priceAddress !== "N/A" && priceAddress !== "0x0000000000000000000000000000000000000001") {
            const priceKey = makeDextoolsPriceKey(dextoolsChain, priceAddress);
            const p = (tokenPrices as any)[priceKey];
            if (p) {
              price = p.price ?? 0;
              changePct = p.variation24h ?? 0;
            }
          }
        }

        // Look up logo from DEXTools metadata if needed
        let dextoolsLogo: string | null = null;
        if (dextoolsChain && token.contractAddress && token.contractAddress !== "N/A" && tokenMetadata) {
          const metadataKey = makeDextoolsPriceKey(dextoolsChain, token.contractAddress);
          const metadata = (tokenMetadata as any)[metadataKey];
          if (metadata?.logo) {
            dextoolsLogo = metadata.logo;
          }
        }

        // Create a separate asset entry for each token on each chain
        assets.push({
          symbol: token.symbol,
          name: token.name,
          icon: getAssetIcon(token.symbol, token.logo, token.contractAddress, dextoolsLogo),
          supported: [chainKey],
          balances: { [chainKey]: amount },
          price,
          changePct,
          chainKey, // Store which chain this token is on
        });
      });
    });

    return assets;
  }, [balancesByChain, chainIdToKey, tokenPrices]);

  const filteredAssets = React.useMemo(() => {
    // Use API data if it has been successfully fetched, otherwise fallback to hardcoded ASSETS
    const assets = isSuccess ? assetsFromAPI : ASSETS;
    
    // Filter by selected chain
    const filtered = selectedChain === "ALL" 
      ? assets 
      : assets.filter(a => {
          if (isSuccess) {
            // For API data, check the chainKey
            return (a as any).chainKey === selectedChain;
          } else {
            // For fallback ASSETS, check balances
            return (a.balances[selectedChain] ?? 0) > 0;
          }
        });
    
    return filtered.map(a => {
      const amount = selectedChain === "ALL"
        ? (isSuccess ? (a.balances[(a as any).chainKey as ChainKey] ?? 0) : sumChains(a.balances))
        : (a.balances[selectedChain] ?? 0);
      return { ...a, displayAmount: amount } as AssetItem & { displayAmount: number; chainKey?: ChainKey };
    })
    // Filter out zero balances - only show assets with actual balance
    .filter(row => row.displayAmount > 0)
    .sort((l, r) => {
      const lUsd = l.displayAmount * (l.price || 0);
      const rUsd = r.displayAmount * (r.price || 0);
      return rUsd - lUsd;
    });
  }, [assetsFromAPI, selectedChain, isSuccess]);

  // Compute main balance from all assets across all chains
  const mainBalance = React.useMemo(() => {
    const assets = isSuccess ? assetsFromAPI : ASSETS;
    let totalUsd = 0;

    assets.forEach(a => {
      if (isSuccess) {
        // For API data, get balance from the chainKey
        const chainKey = (a as any).chainKey as ChainKey;
        const amount = a.balances[chainKey] ?? 0;
        totalUsd += amount * (a.price || 0);
      } else {
        // For fallback ASSETS, sum across all chains
        const totalAmount = sumChains(a.balances);
        totalUsd += totalAmount * (a.price || 0);
      }
    });

    return totalUsd;
  }, [assetsFromAPI, isSuccess]);

  const CHAIN_PRIORITY: ChainKey[] = React.useMemo(() => ["ETH","BSC","LSK","BASE"], []);
  function pickBadgeChain(supported: ChainKey[], selected: ChainKey): ChainKey | null {
    if (selected !== "ALL" && supported.includes(selected)) return selected;
    for (const c of CHAIN_PRIORITY) if (supported.includes(c)) return c;
    return supported[0] ?? null;
  }

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <VisibilityProvider>
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <BorrowTopNav title="Wallet" subtitle="Manage multiple wallets in one place" />
          </div>

          <section className="mt-4">
            <GlobalAccountsScroller />
          </section>

          <section className="mt-6">
            <BalanceRow label="Main balance" amount={formatUsd(mainBalance)} />
          </section>

          <section className="mt-6">
            <QuickActions
              items={React.useMemo(() => ([
                { key: "receive", iconSrc: "/icons/arrow-down-left.svg", label: "Receive", href: "/wallet/receive" },
                { key: "swap",    iconSrc: "/icons/swap.svg",             label: "Swap",    href: "/wallet/swap" },
                { key: "send",    iconSrc: "/icons/arrow-up-right.svg",   label: "Send",    href: "/wallet/send" },
                { key: "history", iconSrc: "/icons/Vector (Stroke).svg",  label: "History", href: "/wallet/history" },
              ]), [])}
            />
          </section>

          {/* Assets list */}
          <section className="mt-6">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-[14px] font-medium cursor-pointer"
                onClick={() => setNetworkModalOpen(true)}
              >
                <Image src={CHAINS.find(c=>c.key===selectedChain)?.icon || "/icons/globe-alt.svg"} alt="chain" width={16} height={16} />
                {CHAINS.find(c=>c.key===selectedChain)?.name || "All networks"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <button type="button" className="rounded-full p-2 hover:bg-gray-100 cursor-pointer" aria-label="Filter">
                <Image src="/icons/filter.svg" alt="Filter" width={20} height={20} />
              </button>
            </div>

            <div className="mt-3 rounded-2xl bg-white">
              {filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Image 
                    src="/icons/sad.svg" 
                    alt="No assets" 
                    width={72} 
                    height={72} 
                    className="mb-4"
                  />
                  <div className="text-[16px] font-semibold text-gray-900">No Assets</div>
                  <div className="text-[12px] text-gray-600 mt-1 text-center">
                    You don't have any assets on {selectedChain === "ALL" ? "any network" : CHAINS.find(c => c.key === selectedChain)?.name || "this network"} yet
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
              {filteredAssets.map((a, idx) => {
                const usd = (a as any).displayAmount * a.price;
                const positive = a.changePct >= 0;
                // For API data, use chainKey; for fallback ASSETS, use pickBadgeChain
                const badgeKey = isSuccess && (a as any).chainKey 
                  ? (selectedChain === "ALL" ? (a as any).chainKey : selectedChain)
                  : pickBadgeChain(a.supported, selectedChain);
                const chainChip = CHAINS.find(c => c.key === badgeKey);
                return (
                  <div key={`${a.symbol}-${(a as any).chainKey || a.symbol}-${idx}`} className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {a.icon ? (
                          <div className="h-12 w-12 rounded-full overflow-hidden bg-white">
                            <Image 
                              src={a.icon} 
                              alt={a.symbol} 
                              width={48} 
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                            {a.symbol.slice(0, 2)}
                          </div>
                        )}
                        {chainChip && chainChip.icon && (
                          <div className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 shadow">
                            <Image src={chainChip.icon} alt={chainChip.name} width={16} height={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[16px] font-semibold">{a.symbol}</div>
                        <div className="text-[12px] text-gray-600">{formatAmount((a as any).displayAmount)} {a.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[16px] font-semibold">{formatUsd(usd)}</div>
                      <div className={`text-[12px] ${positive ? "text-emerald-600" : "text-red-500"}`}>{(positive?"+":"") + a.changePct.toFixed(2)}%</div>
                    </div>
                  </div>
                );
              })}
                </div>
              )}
            </div>
          </section>
          <NetworkSelectModal
            open={networkModalOpen}
            onClose={() => setNetworkModalOpen(false)}
            chains={CHAINS}
            selected={selectedChain}
            onSelect={(k) => { setSelectedChain(k as ChainKey); setNetworkModalOpen(false); }}
          />
        </VisibilityProvider>
      </main>
    </div>
  );
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(n);
}

function formatUsd(n: number) {
  return `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

function sumChains(rec: Partial<Record<string, number>>): number {
  let t = 0;
  for (const k in rec) {
    const v = (rec as any)[k];
    if (Number.isFinite(v) && v > 0) t += v as number;
  }
  return t;
}

function NetworkSelectModal({ open, onClose, chains, selected, onSelect }: {
  open: boolean;
  onClose: () => void;
  chains: Array<{ key: string; name: string; icon: string }>;
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="text-[18px] font-semibold">Select network</div>
        <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
          {chains.map((c) => (
            <button key={c.key} type="button" onClick={() => onSelect(c.key)} className={`flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50 ${selected === c.key ? "bg-gray-50" : ""}`}>
              {c.icon ? <Image src={c.icon} alt={c.name} width={24} height={24} /> : <div className="h-6 w-6" />}
              <div className="flex-1 text-[14px]">{c.name}</div>
              {selected === c.key && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

 
