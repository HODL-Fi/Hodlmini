"use client";

import React from "react";
import Image from "next/image";
import HealthBar from "@/components/HeathBar";
import Modal from "@/components/ui/Modal";
import GlobalAccountsScroller from "@/components/accounts/GlobalAccountsScroller";
import { VisibilityProvider } from "@/components/visibility";
import BorrowTopNav from "@/components/BorrowTopNav";
import { QuickActions } from "@/components/quickActions";
import BalanceRow from "@/components/BalanceRow";
import VaultCollateralPositions from "@/components/vault/VaultCollateralPositions";
import VaultAssetPickerModal from "@/components/vault/VaultAssetPickerModal";
import VaultEditPositionModal from "@/components/vault/VaultEditPositionModal";
import useGetHealthFactor from "@/hooks/vault/useGetHealthFactor";
import useGetCollateralPosition, { CollateralPosition } from "@/hooks/vault/useGetCollateralPosition";
import useGetAccountValue from "@/hooks/vault/useGetAccountValue";
import { useGetAllChainBalances } from "@/hooks/wallet/useGetTokenWalletBalance";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { useTokenMetadataBatch } from "@/hooks/prices/useTokenMetadata";
import { CHAIN_IDS } from "@/utils/constants/chainIds";
import { LOCAL_TOKEN_ICONS } from "@/utils/constants/localTokenIcons";
import { mapHexChainIdToDextools, makeDextoolsPriceKey } from "@/utils/prices/dextools";
import { getWethAddressForChain } from "@/utils/constants/wethAddresses";

type Position = { symbol: string; amount: number };

type ChainKey = "ALL" | "ETH" | "BSC" | "LSK" | "BASE" | "TEST";

type WalletAsset = {
  symbol: string;
  name: string;
  icon: string;
  chainKey: Exclude<ChainKey, "ALL">;
  amount: number;
  price: number;
  address: string;
  chainIdHex: string;
  decimals: number;
};

type BackendPosition = {
  symbol: string;
  amount: number;
};

export default function VaultPage() {
  return (
    <React.Suspense fallback={<div className="min-h-dvh px-3 text-left">Loading…</div>}>
      <VaultPageInner />
    </React.Suspense>
  );
}

function VaultPageInner() {
  // Network selector
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

  const [selectedChain, setSelectedChain] = React.useState<ChainKey>("ALL");
  const [networkModalOpen, setNetworkModalOpen] = React.useState(false);

  // Get chain IDs to fetch
  const chainIdsToFetch = React.useMemo(() => {
    if (selectedChain === "ALL") {
      return Object.values(CHAIN_IDS);
    }
    const chainId = CHAIN_IDS[selectedChain as keyof typeof CHAIN_IDS];
    return chainId ? [chainId] : [];
  }, [selectedChain]);

  const assets = React.useMemo(
    () => [
      { symbol: "ETH", name: "Ethereum", icon: "/assets/eth.svg", priceUsd: 0, collateralFactor: 0, liquidationThreshold: 0 },
      { symbol: "USDT", name: "Tether", icon: "/assets/usdt.svg", priceUsd: 0, collateralFactor: 0, liquidationThreshold: 0 },
      { symbol: "USDC", name: "USD Coin", icon: "/assets/usdc.svg", priceUsd: 0, collateralFactor: 0, liquidationThreshold: 0 },
      { symbol: "BNB", name: "BNB", icon: "/assets/bnb.svg", priceUsd: 0, collateralFactor: 0, liquidationThreshold: 0 },
    ],
    []
  );

  const [positions, setPositions] = React.useState<Position[]>([]);
  const [debtUsd, setDebtUsd] = React.useState<number>(0);
  const [cfLtInfo, setCfLtInfo] = React.useState<{ symbol: string; cf: number; lt: number } | null>(null);
  const [hfInfoOpen, setHfInfoOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState<"deposit" | "withdraw">("deposit");
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [editValue, setEditValue] = React.useState<string>("");
  const [assetPickerOpen, setAssetPickerOpen] = React.useState(false);
  const [assetPickerMode, setAssetPickerMode] = React.useState<"deposit" | "withdraw">("deposit");

  const getAsset = React.useCallback(
    (sym: string) => assets.find((a) => a.symbol === sym),
    [assets]
  );

  const totals = React.useMemo(() => {
    let totalValueUSD = 0, capacityUSD = 0, liqValueUSD = 0;
    positions.forEach((p) => {
      const a = getAsset(p.symbol);
      if (!a || !Number.isFinite(p.amount) || p.amount <= 0) return;
      const val = p.amount * a.priceUsd;
      totalValueUSD += val;
      capacityUSD += val * (a.collateralFactor ?? 0);
      liqValueUSD += val * (a.liquidationThreshold ?? 0);
    });
    const borrowRemainUSD = Math.max(0, capacityUSD - debtUsd);
    const hf = debtUsd > 0 ? liqValueUSD / debtUsd : Infinity;
    const riskPct = !Number.isFinite(hf) ? 0 : Math.min(100, Math.round(100 / hf));
    return { totalValueUSD, capacityUSD, liqValueUSD, borrowRemainUSD, hf, riskPct };
  }, [positions, debtUsd, getAsset]);

  function formatNumber(n: number, d = 2) {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  }

  function formatAmount(n: number) {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(n);
  }

  function formatUsd(n: number) {
    return `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
  }

  function normalizeAccountMetric(raw: number | string | undefined): number {
    const n = Number(raw) || 0;
    if (!Number.isFinite(n)) return 0;
    // Heuristic: if the value looks like a 1e18-scaled integer, normalise it.
    if (n > 1e12) {
      return n / 1e18;
    }
    return n;
  }

  const healthFactors = useGetHealthFactor(chainIdsToFetch);
  const accountValue = useGetAccountValue(chainIdsToFetch);

  // Wallet balances + prices for deposit flow (and collateral positions)
  const chainList = React.useMemo(() => Object.values(CHAIN_IDS), []);
  const collateralPosition = useGetCollateralPosition(chainIdsToFetch);
  const { data: balancesByChain } = useGetAllChainBalances(chainList);

  const allCollateralPositions = React.useMemo<CollateralPosition[]>(() => {
    if (!collateralPosition.data) return [];
    const items: CollateralPosition[] = [];
    Object.values(collateralPosition.data).forEach((list) => {
      (list || []).forEach((asset) => items.push(asset));
    });
    return items;
  }, [collateralPosition.data]);

  const backendPositions = React.useMemo<BackendPosition[]>(() => {
    if (!allCollateralPositions.length) return [];
    const out: BackendPosition[] = [];
    allCollateralPositions.forEach((asset) => {
      const raw = asset.amount;
      const n = Number(raw);
      const decimals = (asset as any).decimals ?? 18;
      if (!Number.isFinite(n) || n <= 0) return;
      const denom = 10 ** decimals;
      const amount = n / denom;
      if (amount <= 0) return;
      out.push({ symbol: asset.symbol, amount });
    });
    return out;
  }, [allCollateralPositions]);

  // Whitelist of valid collateral token addresses (from backend)
  const collateralWhitelist = React.useMemo(() => {
    if (!allCollateralPositions.length) return null;

    const set = new Set<string>();
    allCollateralPositions.forEach((asset) => {
      const cfNum = Number(asset.cf) || 0;
      if (cfNum <= 0) return; // only tokens with positive CF are valid collateral

      const addr = String(asset.address || "").toLowerCase();
      if (!addr) return;
      set.add(addr);
    });

    return set;
  }, [allCollateralPositions]);

  // Keep positions in sync with backend collateral, while preserving any local
  // "ephemeral" zero-amount entries (used for staging a new deposit before the
  // backend reflects it).
  React.useEffect(() => {
    if (!backendPositions.length) return;
    setPositions((prev) => {
      const bySymbol = new Map<string, Position>();

      // Start from backend truth
      backendPositions.forEach((bp) => {
        bySymbol.set(bp.symbol.toUpperCase(), { symbol: bp.symbol, amount: bp.amount });
      });

      // Preserve any local zero-amount entries that aren't yet in backend
      prev.forEach((p) => {
        const key = p.symbol.toUpperCase();
        if (!bySymbol.has(key) && (!Number.isFinite(p.amount) || p.amount === 0)) {
          bySymbol.set(key, p);
        }
      });

      return Array.from(bySymbol.values());
    });
  }, [backendPositions]);

  const priceTokens = React.useMemo(() => {
    if (!balancesByChain) return [];

    const seen = new Set<string>();
    const tokens: { chain: ReturnType<typeof mapHexChainIdToDextools>; address: string }[] = [];

    Object.entries(balancesByChain).forEach(([hexChainId, chainBalances]) => {
      const dextoolsChain = mapHexChainIdToDextools(hexChainId);
      if (!dextoolsChain) return;

      chainBalances.forEach((token) => {
        let addr = token.contractAddress;

        const isEthNative =
          token.symbol.toUpperCase() === "ETH" &&
          (!addr || addr === "N/A" || addr === "0x0000000000000000000000000000000000000001");

        if (isEthNative) {
          const wethAddr = getWethAddressForChain(hexChainId);
          if (wethAddr) {
            addr = wethAddr;
          } else {
            return;
          }
        } else if (!addr || addr === "N/A") {
          return;
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

  const LOCAL_ICONS = React.useMemo(() => [...LOCAL_TOKEN_ICONS], []);

  const getAssetIcon = React.useCallback(
    (symbol: string, apiLogo: string | null | undefined, dextoolsLogo: string | null | undefined): string => {
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
      return "";
    },
    [LOCAL_ICONS]
  );

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
  }, [balancesByChain, LOCAL_ICONS]);

  const { data: tokenMetadata } = useTokenMetadataBatch(metadataTokens as any);

  const chainIdToKey = React.useMemo(() => {
    const map: Record<string, Exclude<ChainKey, "ALL">> = {};
    (Object.entries(CHAIN_IDS) as [Exclude<ChainKey, "ALL">, string][]).forEach(([key, chainId]) => {
      map[chainId] = key;
    });
    return map;
  }, []);

  const walletAssets = React.useMemo<WalletAsset[]>(() => {
    if (!balancesByChain) return [];

    const assets: WalletAsset[] = [];

    Object.entries(balancesByChain).forEach(([chainId, chainBalances]) => {
      const chainKey = chainIdToKey[chainId];
      if (!chainKey) return;

      const dextoolsChain = mapHexChainIdToDextools(chainId);

      chainBalances.forEach((token) => {
        const amount = Number(token.balance) || 0;
        if (!amount || amount <= 0) return;

        // Map wallet token to collateral whitelist address
        let whitelistAddress = (token.contractAddress || "").toLowerCase();
        const isEthNativeForWhitelist =
          token.symbol.toUpperCase() === "ETH" &&
          (!whitelistAddress ||
            whitelistAddress === "n/a" ||
            whitelistAddress === "0x0000000000000000000000000000000000000001");
        if (isEthNativeForWhitelist) {
          // Backend uses this sentinel address for native ETH collateral
          whitelistAddress = "0x0000000000000000000000000000000000000001";
        }

        if (
          collateralWhitelist &&
          (!whitelistAddress || !collateralWhitelist.has(whitelistAddress))
        ) {
          // Not a valid collateral asset according to backend → skip in deposit list
          return;
        }

        let price = 0;
        let dextoolsLogo: string | null = null;
        if (dextoolsChain && tokenPrices) {
          let priceAddress = token.contractAddress;

          const isEthNative =
            token.symbol.toUpperCase() === "ETH" &&
            (!priceAddress ||
              priceAddress === "N/A" ||
              priceAddress === "0x0000000000000000000000000000000000000001");

          if (isEthNative) {
            const wethAddr = getWethAddressForChain(chainId);
            if (wethAddr) {
              priceAddress = wethAddr;
            }
          }

          if (
            priceAddress &&
            priceAddress !== "N/A" &&
            priceAddress !== "0x0000000000000000000000000000000000000001"
          ) {
            const priceKey = makeDextoolsPriceKey(dextoolsChain, priceAddress);
            const p = (tokenPrices as any)[priceKey];
            if (p) {
              price = p.price ?? 0;
            }
          }
        }

        if (dextoolsChain && token.contractAddress && token.contractAddress !== "N/A" && tokenMetadata) {
          const metadataKey = makeDextoolsPriceKey(dextoolsChain, token.contractAddress);
          const metadata = (tokenMetadata as any)[metadataKey];
          if (metadata?.logo) {
            dextoolsLogo = metadata.logo;
          }
        }

        const icon = getAssetIcon(token.symbol, token.logo, dextoolsLogo);

        assets.push({
          symbol: token.symbol,
          name: token.name,
          icon,
          chainKey,
          amount,
          price,
          address: whitelistAddress,
          chainIdHex: chainId,
          decimals: token.decimals ?? 18,
        });
      });
    });

    return assets.sort((l, r) => {
      const lUsd = l.amount * (l.price || 0);
      const rUsd = r.amount * (r.price || 0);
      return rUsd - lUsd;
    });
  }, [balancesByChain, chainIdToKey, tokenPrices, getAssetIcon, collateralWhitelist, tokenMetadata]);

  const walletBalancesBySymbol = React.useMemo(() => {
    const bySymbol = new Map<string, number>();
    walletAssets.forEach((a) => {
      if (selectedChain !== "ALL" && a.chainKey !== selectedChain) return;
      const prev = bySymbol.get(a.symbol) ?? 0;
      bySymbol.set(a.symbol, prev + a.amount);
    });
    return bySymbol;
  }, [walletAssets, selectedChain]);

  // Extract API values based on selected chain
  const apiValues = React.useMemo(() => {
    if (!accountValue.data) return { collateral: null, available: null, debt: null };
    
    if (selectedChain === "ALL") {
      // Sum across all chains
      let totalCollateral = 0;
      let totalAvailable = 0;
      let totalDebt = 0;
      
      Object.values(accountValue.data).forEach((value) => {
        totalCollateral += normalizeAccountMetric(value.collateralValue);
        totalAvailable += normalizeAccountMetric(value.availableToBorrow);
        totalDebt += normalizeAccountMetric(value.debtValue);
      });
      
      return {
        collateral: totalCollateral,
        available: totalAvailable,
        debt: totalDebt,
      };
    } else {
      // Get value for selected chain
      const chainId = CHAIN_IDS[selectedChain as keyof typeof CHAIN_IDS];
      if (!chainId || !accountValue.data[chainId]) {
        return { collateral: null, available: null, debt: null };
      }
      
      const value = accountValue.data[chainId];
      return {
        collateral: normalizeAccountMetric(value.collateralValue),
        available: normalizeAccountMetric(value.availableToBorrow),
        debt: normalizeAccountMetric(value.debtValue),
      };
    }
  }, [accountValue.data, selectedChain]);

  function normalizeHealthFactor(raw: number | string | undefined): number | null {
    if (raw === undefined || raw === null) return null;

    // Backend sometimes returns scientific notation like "2.31165488e+40".
    // For display, treat the mantissa as the value and drop the exponent,
    // then clamp to a finite number.
    if (typeof raw === "string" && /e/i.test(raw)) {
      const [mantissa] = raw.split(/e/i);
      const m = Number(mantissa);
      if (!Number.isFinite(m)) return null;
      return m;
    }

    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return n;
  }

  const apiHealthFactor = React.useMemo(() => {
    if (!healthFactors.data) return null;

    if (selectedChain === "ALL") {
      const entries = Object.values(healthFactors.data);
      if (!entries.length) return null;

      let sum = 0;
      let count = 0;
      for (const entry of entries) {
        const n = normalizeHealthFactor(entry.healthFactor);
        if (n !== null) {
          sum += n;
          count += 1;
        }
      }
      if (!count) return null;
      return sum / count; // average across chains
    } else {
      const chainId = CHAIN_IDS[selectedChain as keyof typeof CHAIN_IDS];
      if (!chainId) return null;
      const entry = healthFactors.data[chainId];
      return normalizeHealthFactor(entry?.healthFactor);
    }
  }, [healthFactors.data, selectedChain]);

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <VisibilityProvider>
        {/* Sticky top nav (like Wallet) */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          {/* <BorrowTopNav title="My Vault" subtitle={`Collateral value $${formatNumber(totals.totalValueUSD)}`} /> */}
          <BorrowTopNav title="My Vault" subtitle="Your vault across networks" />

        </div>

      {/* Accounts scroller */}
      <section className="mt-4">
        <GlobalAccountsScroller />
      </section>


      {/* Total collateral balance */}
      <section className="mt-4">
        <BalanceRow
          label="Total Collateral"
          amount={
            apiValues.collateral !== null
              ? `$${formatNumber(apiValues.collateral)}`
              : `$${formatNumber(totals.totalValueUSD)}`
          }
        />
      </section>

      {/* Quick actions: Deposit / Withdraw */}
      <section className="mt-4">
        <QuickActions
          items={React.useMemo(() => ([
            { key: "deposit", iconSrc: "/icons/plus.svg", label: "Deposit", onClick: () => {
              setAssetPickerMode("deposit");
              setAssetPickerOpen(true);
            } },
            { key: "withdraw", iconSrc: "/icons/arrow-up-right.svg", label: "Withdraw", onClick: () => {
              setAssetPickerMode("withdraw");
              setAssetPickerOpen(true);
            } },
          ]), [positions.length])}
        />
      </section>

            {/* Network selector */}
            <section className="mt-4">
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
        </div>
      </section>


        {/* Capacity & Health */}
        <section className="mt-3 rounded-[16px] border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between text-[14px]">
            <div className="flex items-center gap-2 text-gray-600">
              <span>Health Factor</span>
              <button
                type="button"
                aria-label="What is Health Factor?"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                onClick={() => setHfInfoOpen(true)}
              >
                <Image src="/icons/info.svg" alt="Info" width={16} height={16} />
              </button>
            </div>
            <div className="font-semibold">
              {apiHealthFactor !== null 
                ? (Number.isFinite(apiHealthFactor) ? apiHealthFactor.toFixed(2) : "—")
                : (Number.isFinite(totals.hf) ? totals.hf.toFixed(2) : "—")
              }
            </div>
          </div>
          <div className="mt-2">
            <HealthBar percentage={totals.riskPct} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[14px]">
            <div className="text-gray-600">Borrow limit remaining</div>
            <div className="text-right font-semibold">
              {apiValues.available !== null ? `$${formatNumber(apiValues.available)}` : `$${formatNumber(totals.borrowRemainUSD)}`}
            </div>
            <div className="text-gray-600">Current debt</div>
            <div className="text-right font-semibold">
              {apiValues.debt !== null ? `$${formatNumber(apiValues.debt)}` : `$${formatNumber(debtUsd)}`}
            </div>
          </div>
        </section>

        {/* Positions list */}
        <VaultCollateralPositions
          positions={positions}
          assets={assets}
          walletAssets={walletAssets}
          selectedChain={selectedChain}
          allCollateralPositions={allCollateralPositions}
          chains={CHAINS}
          onEdit={(mode, index) => {
            setEditMode(mode);
            setEditIndex(index);
            setEditValue("");
            setEditOpen(true);
          }}
          onShowCfLt={(symbol, cf, lt) => {
            setCfLtInfo({ symbol, cf, lt });
          }}
        />
        </VisibilityProvider>
      </main>
      {/* Deposit / Withdraw modal */}
      <VaultEditPositionModal
        open={editOpen}
        mode={editMode}
        position={editIndex !== null ? positions[editIndex] ?? null : null}
        walletAsset={
          (() => {
            const pos = editIndex !== null ? positions[editIndex] : null;
            if (!pos) return undefined;
            const symbol = pos.symbol;
            return walletAssets.find(
              (wa) =>
                wa.symbol?.toUpperCase() === symbol.toUpperCase() &&
                (selectedChain === "ALL" || wa.chainKey === selectedChain)
            );
          })()
        }
        walletBalance={
          (() => {
            const pos = editIndex !== null ? positions[editIndex] : null;
            if (!pos) return 0;
            const symbol = pos.symbol;
            return walletBalancesBySymbol.get(symbol) ?? 0;
          })()
        }
        editValue={editValue}
        onChangeEditValue={setEditValue}
        formatAmount={formatAmount}
        formatUsd={formatUsd}
        onClose={() => setEditOpen(false)}
      />

      {/* Asset picker for Quick Actions */}
      <VaultAssetPickerModal
        open={assetPickerOpen}
        mode={assetPickerMode}
        walletAssets={walletAssets}
        positions={positions}
        assets={assets}
        selectedChain={selectedChain}
        chains={CHAINS}
        formatAmount={formatAmount}
        formatUsd={formatUsd}
        onClose={() => setAssetPickerOpen(false)}
        onSelectDepositAsset={(symbol) => {
          const existingIndex = positions.findIndex((p) => p.symbol === symbol);
                    if (existingIndex !== -1) {
                      setEditMode("deposit");
                      setEditIndex(existingIndex);
                      setEditValue("");
                      setEditOpen(true);
                    } else {
                      const nextIndex = positions.length;
            setPositions((prev) => [...prev, { symbol, amount: 0 }]);
                      setTimeout(() => {
                        setEditMode("deposit");
                        setEditIndex(nextIndex);
                        setEditValue("");
                        setEditOpen(true);
                      }, 0);
                    }
                  }}
        onSelectWithdrawPosition={(index) => {
          const p = positions[index];
          if (!p || !p.amount || p.amount <= 0) return;
                      setEditMode("withdraw");
          setEditIndex(index);
                      setEditValue("");
                      setEditOpen(true);
                    }}
      />
      {/* CF / LT info modal */}
      <Modal open={!!cfLtInfo} onClose={() => setCfLtInfo(null)}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="text-[18px] font-semibold">About collateral & liquidation</div>
            <button type="button" aria-label="Close" onClick={() => setCfLtInfo(null)} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          {cfLtInfo && (
            <div className="space-y-2 text-[14px] text-gray-700">
              <div className="text-[14px] text-gray-900 font-semibold">{cfLtInfo.symbol}</div>
              <div>
                <span className="font-medium">Collateral Factor (CF):</span> Up to {Math.round(cfLtInfo.cf * 100)}% of the asset’s USD value contributes to your borrow limit.
              </div>
              <div>
                <span className="font-medium">Liquidation Threshold (LT):</span> If your Health Factor falls to 1.0, positions may be liquidated at about {Math.round(cfLtInfo.lt * 100)}% of the asset’s value.
              </div>
              <div className="rounded-md bg-[#FFF7D6] p-3 text-[13px] text-gray-700">
                Tip: Higher CF increases borrowing power. Higher LT increases liquidation sensitivity. Keep Health Factor comfortably above 1.2.
              </div>
            </div>
          )}
        </div>
      </Modal>
      <Modal open={hfInfoOpen} onClose={() => setHfInfoOpen(false)}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="text-[18px] font-semibold">About Health Factor</div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setHfInfoOpen(false)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-[14px] text-gray-700">
            <p>
              Health Factor is a risk indicator that compares the USD value of your collateral at
              its liquidation thresholds to your current debt. Higher values mean your positions
              are safer from liquidation.
            </p>
            <p>
              When Health Factor approaches 0 , your positions may be liquidated if markets move
              against you. Values comfortably above 1+ are generally considered safer.
            </p>
            <div className="rounded-md bg-[#FFF7D6] p-3 text-[13px] text-gray-700">
              Tip: If your Health Factor trends down, consider adding collateral or repaying debt to
              reduce liquidation risk.
            </div>
          </div>
        </div>
      </Modal>
      <NetworkSelectModal
        open={networkModalOpen}
        onClose={() => setNetworkModalOpen(false)}
        chains={CHAINS}
        selected={selectedChain}
        onSelect={(k) => { setSelectedChain(k as ChainKey); setNetworkModalOpen(false); }}
      />
    </div>
  );
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


