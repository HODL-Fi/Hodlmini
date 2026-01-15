"use client";

export const dynamic = 'force-dynamic';

import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import BorrowTopNav from "@/components/BorrowTopNav";
import { CustomInput } from "@/components/inputs";
import Modal from "@/components/ui/Modal";
import BorrowSummary from "@/components/borrow/BorrowSummary";
import BorrowConfirmingModal from "@/components/borrow/BorrowConfirmingModal";
import BorrowSuccessModal from "@/components/borrow/BorrowSuccessModal";
import BorrowFailedModal from "@/components/borrow/BorrowFailedModal";
import BankSelectModal, { type BankAccount } from "@/components/borrow/BankSelectModal";
import HealthBar from "@/components/HeathBar";
import { useGetAllChainBalances } from "@/hooks/wallet/useGetTokenWalletBalance";
import { useDepositCollateral } from "@/hooks/vault/useDepositCollateral";
import { useBorrow, type BorrowRequest } from "@/hooks/vault/useBorrow";
import useGetCollateralPosition, { type CollateralPosition } from "@/hooks/vault/useGetCollateralPosition";
import useGetAccountValue from "@/hooks/vault/useGetAccountValue";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { mapHexChainIdToDextools, makeDextoolsPriceKey } from "@/utils/prices/dextools";
import { getWethAddressForChain } from "@/utils/constants/wethAddresses";
import { normalizeMantleNativeToken, getPriceLookupInfo } from "@/utils/balances/normalizeMantleToken";
import { CHAIN_IDS } from "@/utils/constants/chainIds";
import { CNGN_BASE_ADDRESS, CNGN_DECIMALS } from "@/utils/constants/cngn";
import { useNgnConversion } from "@/hooks/useNgnConversion";
import { getTokenDecimals } from "@/utils/constants/tokenDecimals";
import useGetLinkedAccounts from "@/hooks/settings/useGetLinkedAccounts";
import { getBankNameByCode, getBankLogo } from "@/utils/banks/bankLogos";
import useGetSupportedInstitutions from "@/hooks/offramp/useGetSupportedInstitutions";
import useGetUserProfile from "@/hooks/user/useGetUserProfile";

export default function BorrowPage() {
  return (
    <React.Suspense fallback={<div className="min-h-dvh px-3 text-left">Loading…</div>}>
      <BorrowPageInner />
    </React.Suspense>
  );
}

function BorrowPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const modeParam = searchParams?.get("mode") ?? undefined; // existing | new
  const isExistingMode = modeParam === "existing";
  const fiats = React.useMemo(() => ([
    // MVP: Only NGN and cNGN for borrowing
    { code: "NGN",  name: "Nigerian Naira",            icon: "/fiat/ngn.svg" },
    // { code: "GHC",  name: "Ghanian Cedi",              icon: "/fiat/ghs.svg" },
    // { code: "KHS",  name: "Kenyan Shillings",          icon: "/fiat/khs.svg" },
    // { code: "ZAR",  name: "South African Rand",        icon: "/fiat/zar.svg" },
    { code: "cNGN", name: "compliant NGN (on-chain)",  icon: "/assets/cngn.svg" },
  ]), []);

  const [collateralLines, setCollateralLines] = React.useState<{ symbol: string; amount: string }[]>([]);
  const [selectedFiat, setSelectedFiat] = React.useState(fiats[0]);
  const [fiatReceive, setFiatReceive] = React.useState("");
  const [assetModalOpen, setAssetModalOpen] = React.useState(false);
  const [assetRowIndex, setAssetRowIndex] = React.useState<number | null>(null);
  const [fiatModalOpen, setFiatModalOpen] = React.useState(false);
  const [ltvInfoOpen, setLtvInfoOpen] = React.useState(false);
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const [confirmingOpen, setConfirmingOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [failedOpen, setFailedOpen] = React.useState(false);
  const [confirmProgress, setConfirmProgress] = React.useState(0);
  const [bankOpen, setBankOpen] = React.useState(false);
  
  // Get user profile to determine currency
  const { data: profile } = useGetUserProfile();
  const currency = React.useMemo(() => {
    if (profile?.country?.toLowerCase() === "ng") {
      return "NGN";
    }
    return "NGN";
  }, [profile?.country]);
  
  // Get linked bank accounts from API
  const { data: linkedAccounts, isLoading: isLoadingLinkedAccounts } = useGetLinkedAccounts();
  const { data: institutionsData } = useGetSupportedInstitutions(currency);
  
  // Create a map from Swift code to bank name for lookup
  const swiftCodeToNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    if (institutionsData?.institutions) {
      institutionsData.institutions.forEach((institution) => {
        map.set(institution.code.toUpperCase(), institution.name);
      });
    }
    return map;
  }, [institutionsData]);
  
  // Map API response to BankAccount format
  const bankAccounts = React.useMemo<BankAccount[]>(() => {
    if (!linkedAccounts) return [];
    
    return linkedAccounts.map((account) => {
      const bankName = swiftCodeToNameMap.get(account.bankCode.toUpperCase()) || account.bankName;
      return {
        id: account.id,
        name: account.accountName,
        number: account.accountNumber,
        bank: bankName,
        logo: getBankLogo(account.bankCode, bankName),
      };
    });
  }, [linkedAccounts, swiftCodeToNameMap]);
  
  const [selectedBankId, setSelectedBankId] = React.useState<string | null>(bankAccounts[0]?.id ?? null);
  
  // Update selected bank when accounts load
  React.useEffect(() => {
    if (bankAccounts.length > 0 && !selectedBankId) {
      setSelectedBankId(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedBankId]);
  const [collateralExpanded, setCollateralExpanded] = React.useState(true);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = React.useState(false);
  const [showBottomShadow, setShowBottomShadow] = React.useState(false);
  const [isProcessingBorrow, setIsProcessingBorrow] = React.useState(false);

  // Tenure & rates
  const TENURES = React.useMemo(() => [7, 30, 60, 90, 365], []);
  const [tenureDays, setTenureDays] = React.useState<number>(30);
  const BASE_DAILY_RATE = 0.0005; // 0.05% per day
  const OVERDUE_DAILY_RATE = 0.00025; // 0.025% per day after tenure

  // Removed hardcoded LTV - all collateral factors should come from API

  const isCngnOnchain = selectedFiat.code === "cNGN";

  const chainList = React.useMemo(() => Object.values(CHAIN_IDS), []);
  const { data: balancesByChain } = useGetAllChainBalances(chainList);
  const collateralPosition = useGetCollateralPosition(chainList);
  // Temporarily exclude Base from account values endpoint
  const accountValueChainList = React.useMemo(() => chainList.filter(chainId => chainId !== CHAIN_IDS.BASE), [chainList]);
  const accountValue = useGetAccountValue(accountValueChainList);
  const { mutateAsync: depositCollateral } = useDepositCollateral();
  const { mutateAsync: borrow } = useBorrow();
  const { usdToNgnRate, cngnPrice } = useNgnConversion();

  // Normalize account metric (handle 1e18 scaling)
  function normalizeAccountMetric(raw: number | string | undefined): number {
    const n = Number(raw) || 0;
    if (!Number.isFinite(n)) return 0;
    // Heuristic: if the value looks like a 1e18-scaled integer, normalise it.
    if (n > 1e12) {
      return n / 1e18;
    }
    return n;
  }

  // Get existing debt in USD (sum across all chains)
  const existingDebtUsd = React.useMemo(() => {
    if (!accountValue.data) return 0;
    let totalDebt = 0;
    Object.values(accountValue.data).forEach((value) => {
      totalDebt += normalizeAccountMetric(value.debtValue);
    });
    return totalDebt;
  }, [accountValue.data]);

  // DEXTools price tokens derived from wallet balances
  const priceTokens = React.useMemo(() => {
    if (!balancesByChain) return [];

    const seen = new Set<string>();
    const tokens: { chain: ReturnType<typeof mapHexChainIdToDextools>; address: string }[] = [];

    Object.entries(balancesByChain).forEach(([hexChainId, chainBalances]) => {
      chainBalances.forEach((token) => {
        // Normalize Mantle native token
        const normalizedToken = normalizeMantleNativeToken(hexChainId, token);
        
        // Check for special price lookup (MNT uses Ethereum chain)
        const priceLookup = getPriceLookupInfo(hexChainId, token);
        if (priceLookup) {
          const key = makeDextoolsPriceKey(priceLookup.chain, priceLookup.address);
          if (seen.has(key)) return;
          seen.add(key);
          tokens.push({ chain: priceLookup.chain, address: priceLookup.address });
          return;
        }

        const dextoolsChain = mapHexChainIdToDextools(hexChainId);
        if (!dextoolsChain) return;

        let addr = normalizedToken.contractAddress;

        const isEthNative =
          normalizedToken.symbol.toUpperCase() === "ETH" &&
          (!addr ||
            addr === "N/A" ||
            addr === "0x0000000000000000000000000000000000000001");

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

  // Whitelist of valid collateral token addresses (from backend)
  const collateralWhitelist = React.useMemo(() => {
    if (!collateralPosition.data) return null;
    const set = new Set<string>();
    Object.values(collateralPosition.data).forEach((list) => {
      (list || []).forEach((asset: CollateralPosition) => {
        const cfNum = Number(asset.cf) || 0;
        if (cfNum <= 0) return;
        const addr = String(asset.address || "").toLowerCase();
        if (!addr) return;
        set.add(addr);
      });
    });
    return set;
  }, [collateralPosition.data]);

  // Map of symbol -> collateral factor (fraction, e.g. 0.7 for 70%)
  const cfBySymbol = React.useMemo(() => {
    const map = new Map<string, number>();
    if (!collateralPosition.data) return map;

    Object.entries(collateralPosition.data).forEach(([chainId, list]) => {
      (list || []).forEach((asset: CollateralPosition) => {
        const cfNum = Number(asset.cf) || 0;
        if (cfNum <= 0) return;
        let sym = asset.symbol?.toUpperCase();
        if (!sym) return;
        
        // Normalize Mantle native token: if backend returns ETH for Mantle chain with placeholder address, use MNT
        const addr = String(asset.address || "").toLowerCase();
        const chainIdStr = String(chainId).toLowerCase();
        // Check if this is Mantle chain (0x1388 hex or 5000 decimal)
        const isMantleChain = chainIdStr === "0x1388" || chainIdStr === "5000" || 
                             chainIdStr === CHAIN_IDS.MANTLE.toLowerCase();
        // Check if this is the native token placeholder address
        const isPlaceholderAddress = addr === "0x0000000000000000000000000000000000000001" || 
                                    addr === "1";
        if (isMantleChain && isPlaceholderAddress && sym === "ETH") {
          sym = "MNT";
        }
        
        const cfFraction = cfNum / 10_000; // bps -> fraction
        const prev = map.get(sym);
        // Keep the highest CF we see for this symbol across chains
        if (prev == null || cfFraction > prev) {
          map.set(sym, cfFraction);
        }
      });
    });

    return map;
  }, [collateralPosition.data]);

  // Backend existing positions (normalize by decimals and aggregate per symbol)
  const backendExistingPositions = React.useMemo(() => {
    if (!collateralPosition.data) return [] as { symbol: string; amount: number }[];

    const bySymbol = new Map<string, number>();
    Object.entries(collateralPosition.data).forEach(([chainId, list]) => {
      (list || []).forEach((asset: CollateralPosition) => {
        const raw = Number(asset.amount);
        const decimals = getTokenDecimals((asset as any).decimals, asset.symbol, String(asset.address || ""));
        if (!Number.isFinite(raw) || raw <= 0) return;
        const denom = 10 ** decimals;
        const amt = raw / denom;
        if (amt <= 0) return;
        let sym = asset.symbol?.toUpperCase();
        if (!sym) return;
        
        // Normalize Mantle native token: if backend returns ETH for Mantle chain with placeholder address, use MNT
        const chainIdStr = String(chainId).toLowerCase();
        const isMantleChain = chainIdStr === "0x1388" || chainIdStr === "5000" || 
                             chainIdStr === CHAIN_IDS.MANTLE.toLowerCase();
        const addr = String(asset.address || "").toLowerCase();
        const isPlaceholderAddress = addr === "0x0000000000000000000000000000000000000001" || 
                                    addr === "1";
        if (isMantleChain && isPlaceholderAddress && sym === "ETH") {
          sym = "MNT";
        }
        
        const prev = bySymbol.get(sym) ?? 0;
        bySymbol.set(sym, prev + amt);
      });
    });

    return Array.from(bySymbol.entries()).map(([symbol, amount]) => ({ symbol, amount }));
  }, [collateralPosition.data]);

  const hasBackendCollateral = backendExistingPositions.length > 0;

  // Prefer backend positions as existing portfolio
  const existingPositions = React.useMemo(
    () => backendExistingPositions,
    [backendExistingPositions]
  );

  // If user already has collateral and no explicit mode is set, default to existing mode
  React.useEffect(() => {
    if (!mounted) return;
    if (modeParam) return;
    if (!hasBackendCollateral) return;

    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    sp.set("mode", "existing");
    router.replace(`/borrow?${sp.toString()}`);
  }, [mounted, modeParam, hasBackendCollateral, router, searchParams]);

  // Symbols that are both in the wallet (balance > 0) and whitelisted as collateral
  const availableCollateralSymbols = React.useMemo(() => {
    const set = new Set<string>();
    if (!balancesByChain) return set;

    Object.entries(balancesByChain).forEach(([hexChainId, chainBalances]) => {
      chainBalances.forEach((token) => {
        const amount = Number(token.balance) || 0;
        if (amount <= 0) return;

        // Normalize Mantle native token
        const normalizedToken = normalizeMantleNativeToken(hexChainId, token);

        let whitelistAddress = (normalizedToken.contractAddress || "").toLowerCase();
        const symbolUpper = normalizedToken.symbol.toUpperCase();
        const isNativeTokenForWhitelist =
          (symbolUpper === "ETH" || symbolUpper === "MNT") &&
          (!whitelistAddress ||
            whitelistAddress === "n/a" ||
            whitelistAddress === "0x0000000000000000000000000000000000000001");
        if (isNativeTokenForWhitelist) {
          // Backend uses this sentinel address for native tokens (ETH, MNT, etc.) as collateral
          whitelistAddress = "0x0000000000000000000000000000000000000001";
        }

        if (
          collateralWhitelist &&
          (!whitelistAddress || !collateralWhitelist.has(whitelistAddress))
        ) {
          return;
        }

        set.add(normalizedToken.symbol.toUpperCase());
      });
    });

    return set;
  }, [balancesByChain, collateralWhitelist]);

  // Build assets dynamically from available collateral tokens in wallet
  const assets = React.useMemo(() => {
    const assetMap = new Map<string, { symbol: string; name: string; icon: string; priceUsd: number; balance: number; collateralFactor: number; liquidationThreshold: number }>();
    
    // Add static assets first (for known tokens with local icons)
    const staticAssets: Array<{ symbol: string; name: string; icon: string }> = [
      { symbol: "cNGN", name: "compliant NGN", icon: "/assets/cngn.svg" },
      { symbol: "ETH", name: "Ethereum", icon: "/assets/eth.svg" },
      { symbol: "MNT", name: "Mantle", icon: "/chains/mantle.svg" },
      { symbol: "WETH", name: "Wrapped ETH", icon: "/assets/weth.svg" },
      { symbol: "USDT", name: "Tether", icon: "/assets/usdt.svg" },
      { symbol: "USDC", name: "USD Coin", icon: "/assets/usdc.svg" },
      { symbol: "DAI", name: "DAI", icon: "/assets/dai.svg" },
      { symbol: "BNB", name: "BNB", icon: "/assets/bnb.svg" },
      { symbol: "LINK", name: "ChainLink Token", icon: "/assets/link.svg" },
    ];
    
    staticAssets.forEach(a => {
      assetMap.set(a.symbol.toUpperCase(), {
        ...a,
        priceUsd: 0,
        balance: 0,
        collateralFactor: 0,
        liquidationThreshold: 0,
      });
    });
    
    // Add dynamic assets from wallet balances that are available as collateral
    if (balancesByChain && availableCollateralSymbols.size > 0) {
      Object.entries(balancesByChain).forEach(([hexChainId, chainBalances]) => {
        chainBalances.forEach((token) => {
          const normalizedToken = normalizeMantleNativeToken(hexChainId, token);
          const symbolUpper = normalizedToken.symbol.toUpperCase();
          
          if (availableCollateralSymbols.has(symbolUpper) && !assetMap.has(symbolUpper)) {
            // Determine icon path
            const symbolLower = normalizedToken.symbol.toLowerCase();
            let icon = "/assets/eth.svg"; // default fallback
            
            // Check for local icons first
            if (symbolLower === "mnt") {
              icon = "/chains/mantle.svg";
            } else if (["eth", "usdt", "usdc", "dai", "weth", "bnb", "cngn", "link"].includes(symbolLower)) {
              icon = `/assets/${symbolLower}.svg`;
            } else if (normalizedToken.logo) {
              icon = normalizedToken.logo;
            }
            
            assetMap.set(symbolUpper, {
              symbol: normalizedToken.symbol,
              name: normalizedToken.name,
              icon,
              priceUsd: 0,
              balance: 0,
              collateralFactor: 0,
              liquidationThreshold: 0,
            });
          }
        });
      });
    }
    
    // Return only assets that are in availableCollateralSymbols
    return Array.from(assetMap.values()).filter(a => 
      availableCollateralSymbols.has(a.symbol.toUpperCase())
    );
  }, [balancesByChain, availableCollateralSymbols]);

  // Initialize collateralLines when assets become available
  React.useEffect(() => {
    if (assets.length > 0 && collateralLines.length === 0) {
      setCollateralLines([{ symbol: assets[0].symbol, amount: "" }]);
    }
  }, [assets, collateralLines.length]);

  // Parse usdValue from API (handles scientific notation like "9.9979195e+26")
  const parseUsdValue = (usdValue: string | number | undefined): number => {
    if (usdValue == null) return 0;
    const str = String(usdValue).trim();
    if (!str || str === "0") return 0;
    const num = Number(str);
    return Number.isFinite(num) && num > 0 ? num : 0;
  };

  // Price per token from API (usdValue / normalizedAmount)
  const priceBySymbolFromApi = React.useMemo(() => {
    const priceMap = new Map<string, number>();
    
    if (!collateralPosition.data) return priceMap;
    
    Object.values(collateralPosition.data).forEach((list) => {
      (list || []).forEach((asset: CollateralPosition) => {
        const raw = Number(asset.amount);
        if (!Number.isFinite(raw) || raw <= 0) return;
        
        const decimals = getTokenDecimals((asset as any).decimals, asset.symbol, String(asset.address || ""));
        const denom = 10 ** decimals;
        const normalizedAmount = raw / denom;
        if (normalizedAmount <= 0) return;
        
        // Get USD value from API
        const rawUsdValue = parseUsdValue(asset.usdValue);
        if (rawUsdValue <= 0) return;
        
        // usdValue appears to be: amount * price * 1e18 (where amount is in smallest units, price is per token)
        // To get price per token: price = usdValue / (amount * 1e18)
        // Since amount = raw (in smallest units), and normalizedAmount = raw / 10^decimals:
        // price = usdValue / (raw * 1e18) = usdValue / ((normalizedAmount * 10^decimals) * 1e18)
        // price = usdValue / (normalizedAmount * 10^decimals * 1e18)
        let pricePerToken = 0;
        if (rawUsdValue > 1e12) {
          // If very large, it's likely scaled by 1e18
          // price = usdValue / (amount * 1e18) = usdValue / (normalizedAmount * 10^decimals * 1e18)
          pricePerToken = rawUsdValue / (normalizedAmount * denom * 1e18);
        } else {
          // If not scaled, usdValue is already the total USD value
          pricePerToken = rawUsdValue / normalizedAmount;
        }
        
        // Sanity check: price should be reasonable (between $0.0001 and $1,000,000)
        if (pricePerToken > 0 && pricePerToken >= 0.0001 && pricePerToken <= 1000000) {
          const sym = asset.symbol?.toUpperCase();
          if (sym) {
            // If multiple positions for same symbol, use the average or latest (for now, overwrite)
            priceMap.set(sym, pricePerToken);
          }
        }
      });
    });
    
    return priceMap;
  }, [collateralPosition.data, parseUsdValue]);

  // Per-symbol wallet balances and USD prices (from API first, then DEXTools fallback)
  const { balanceBySymbol, priceBySymbol } = React.useMemo(() => {
    const balances = new Map<string, number>();
    const usdSums = new Map<string, number>();

    if (!balancesByChain) {
      return { balanceBySymbol: balances, priceBySymbol: priceBySymbolFromApi };
    }

    Object.entries(balancesByChain).forEach(([hexChainId, chainBalances]) => {
      chainBalances.forEach((token) => {
        const amount = Number(token.balance) || 0;
        if (!amount || amount <= 0) return;

        // Normalize Mantle native token
        const normalizedToken = normalizeMantleNativeToken(hexChainId, token);
        const sym = normalizedToken.symbol.toUpperCase();
        const prevBal = balances.get(sym) ?? 0;
        balances.set(sym, prevBal + amount);
        
        // Use API price if available, otherwise try DEXTools
        const apiPrice = priceBySymbolFromApi.get(sym);
        if (apiPrice && apiPrice > 0) {
          const prevUsd = usdSums.get(sym) ?? 0;
          usdSums.set(sym, prevUsd + amount * apiPrice);
        } else if (tokenPrices) {
          // Check for special price lookup (MNT uses Ethereum chain)
          const priceLookup = getPriceLookupInfo(hexChainId, token);
          if (priceLookup) {
            const priceKey = makeDextoolsPriceKey(priceLookup.chain, priceLookup.address);
            const p = (tokenPrices as any)[priceKey];
            const price = p?.price ?? 0;
            if (price > 0) {
              const prevUsd = usdSums.get(sym) ?? 0;
              usdSums.set(sym, prevUsd + amount * price);
            }
            return;
          }

          const dextoolsChain = mapHexChainIdToDextools(hexChainId);
          if (!dextoolsChain) return;

          let priceAddress = normalizedToken.contractAddress;

          const isEthNative =
            normalizedToken.symbol.toUpperCase() === "ETH" &&
            (!priceAddress ||
              priceAddress === "N/A" ||
              priceAddress === "0x0000000000000000000000000000000000000001");

          if (isEthNative) {
            const wethAddr = getWethAddressForChain(hexChainId);
            if (wethAddr) {
              priceAddress = wethAddr;
            } else {
              return;
            }
          } else if (!priceAddress || priceAddress === "N/A") {
            return;
          }

          const priceKey = makeDextoolsPriceKey(dextoolsChain, priceAddress);
          const p = (tokenPrices as any)[priceKey];
          const price = p?.price ?? 0;
          if (price > 0) {
            const prevUsd = usdSums.get(sym) ?? 0;
            usdSums.set(sym, prevUsd + amount * price);
          }
        }
      });
    });

    // Build final price map: API prices take priority, then calculated from DEXTools
    const prices = new Map<string, number>(priceBySymbolFromApi);
    usdSums.forEach((usd, sym) => {
      const bal = balances.get(sym) ?? 0;
      if (bal > 0 && !prices.has(sym)) {
        // Only use DEXTools price if API price not available
        prices.set(sym, usd / bal);
      }
    });

    return { balanceBySymbol: balances, priceBySymbol: prices };
  }, [balancesByChain, tokenPrices, priceBySymbolFromApi]);

  function toSmallestUnits(amountStr: string, decimals: number): string {
    const cleaned = (amountStr || "").replace(/,/g, "").trim();
    if (!cleaned) return "0";
    const negative = cleaned.startsWith("-");
    const unsigned = negative ? cleaned.slice(1) : cleaned;
    const [wholePartRaw, fracPartRaw = ""] = unsigned.split(".");
    const wholePart = wholePartRaw.replace(/^0+/, "") || "0";
    const fracPart = fracPartRaw.slice(0, decimals).padEnd(decimals, "0");
    const combined = `${wholePart}${fracPart}`.replace(/^0+/, "") || "0";
    return negative ? `-${combined}` : combined;
  }

  function resolveCollateralToken(symbol: string) {
    if (!balancesByChain) return null;
    const upper = symbol.toUpperCase();
    for (const [chainId, chainBalances] of Object.entries(balancesByChain)) {
      const match = chainBalances.find(
        (t) =>
          t.symbol?.toUpperCase() === upper &&
          t.contractAddress &&
          t.contractAddress !== "N/A"
      );
      if (match) {
        return {
          tokenAddress: match.contractAddress.toLowerCase(),
          chainIdHex: chainId,
          decimals: match.decimals ?? 18,
        };
      }
    }
    return null;
  }

  function formatNumber(n: number, fractionDigits = 2) {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(n);
  }

  function formatFiat(code: string, amount: number) {
    // cNGN is an on-chain token, show it as "123,456.00 cNGN" instead of a fiat symbol.
    if (code === "cNGN") {
      return `${formatNumber(amount)} cNGN`;
    }

    // Simple symbol mapping; extend as needed
    const symbols: Record<string, string> = { NGN: "₦", ZAR: "R", GHC: "₵", KHS: "KSh" };
    const prefix = symbols[code] ?? "";
    return `${prefix}${formatNumber(amount)}`;
  }

  function computeLtvUsagePercent(valueStr: string, maxFiat: number) {
    const v = parseFloat((valueStr || "0").replace(/,/g, ""));
    if (!isFinite(v) || v <= 0 || maxFiat <= 0) return 0;
    return Math.max(0, Math.min(100, (v / maxFiat) * 100));
  }

  function handleMaxCollateral(rowIndex: number) {
    setCollateralLines((prev) => {
      const next = [...prev];
      const sym = next[rowIndex].symbol.toUpperCase();
      const bal = balanceBySymbol.get(sym) ?? 0;
      next[rowIndex] = { ...next[rowIndex], amount: bal ? String(bal) : "" };
      return next;
    });
  }

  function handleMaxReceive() {
    // Use maxLendForCollateral which already accounts for existing debt
    setFiatReceive(maxLendForCollateral > 0 ? formatNumber(maxLendForCollateral) : "");
  }

  // keep receive independent; no auto-overwrite on collateral/asset/fiat changes

  // Calculate total collateral capacity (existing + new) in USD
  const totalCollateralCapacityUsd = React.useMemo(() => {
    let capacity = 0;

    // Add existing positions capacity
    if (isExistingMode || existingPositions.length > 0) {
      capacity += existingPositions.reduce((sum, pos) => {
        const sym = pos.symbol.toUpperCase();
        const price = priceBySymbol.get(sym) ?? 0;
        const cf = cfBySymbol.get(sym);
        // Only include if we have collateral factor from API
        if (cf === undefined || cf <= 0) return sum;
        const amt = pos.amount;
        if (!isFinite(amt) || amt <= 0 || price <= 0) return sum;
        return sum + amt * price * cf;
      }, 0);
    }

    // Add new collateral capacity (if in new mode or adding new collateral)
    if (!isExistingMode) {
      capacity += collateralLines.reduce((sum, line) => {
        const sym = line.symbol.toUpperCase();
        const price = priceBySymbol.get(sym) ?? 0;
        const cf = cfBySymbol.get(sym);
        // Only include if we have collateral factor from API
        if (cf === undefined || cf <= 0) return sum;
        const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
        if (!isFinite(amt) || amt <= 0 || price <= 0) return sum;
        return sum + amt * price * cf;
      }, 0);
    }

    return capacity;
  }, [collateralLines, isExistingMode, existingPositions, priceBySymbol, cfBySymbol]);

  // Get available to borrow from backend (for existing mode)
  const availableToBorrowFromBackend = React.useMemo(() => {
    if (!accountValue.data) return 0;
    let total = 0;
    Object.values(accountValue.data).forEach((value) => {
      total += normalizeAccountMetric(value.availableToBorrow);
    });
    return total;
  }, [accountValue.data]);

  // Convert existing debt to selected fiat currency
  const existingDebtInFiat = React.useMemo(() => {
    if (existingDebtUsd <= 0) return 0;

    if (selectedFiat.code === "cNGN") {
      if (cngnPrice > 0) {
        return existingDebtUsd / cngnPrice;
      }
      return existingDebtUsd;
    }

    if (selectedFiat.code === "NGN") {
      if (usdToNgnRate > 0) {
        return existingDebtUsd * usdToNgnRate;
      }
      return existingDebtUsd;
    }

    // Other fiats currently treated as USD 1:1
    return existingDebtUsd;
  }, [existingDebtUsd, selectedFiat.code, cngnPrice, usdToNgnRate]);

  // Max lending amount = total capacity - existing debt
  const maxLendForCollateral = React.useMemo(() => {
    let availableUsd = 0;

    if (isExistingMode) {
      // For existing mode: use backend value
      availableUsd = availableToBorrowFromBackend;
    } else {
      // For first-time borrow (new mode): calculate from selected collateral tokens
      if (!isFinite(totalCollateralCapacityUsd) || totalCollateralCapacityUsd <= 0) {
        return 0;
      }
      // Use the calculated capacity from selected collateral (no debt subtraction needed for first-time)
      availableUsd = totalCollateralCapacityUsd;
    }

    // Convert to selected fiat
    let availableInFiat = availableUsd;

    if (selectedFiat.code === "cNGN") {
      if (cngnPrice > 0) {
        availableInFiat = availableUsd / cngnPrice;
      }
    } else if (selectedFiat.code === "NGN") {
      if (usdToNgnRate > 0) {
        availableInFiat = availableUsd * usdToNgnRate;
      }
    }

    return Math.max(0, availableInFiat);
  }, [isExistingMode, totalCollateralCapacityUsd, availableToBorrowFromBackend, selectedFiat.code, cngnPrice, usdToNgnRate]);

  // Max capacity in selected fiat (before subtracting debt) - for display
  const maxCapacityInFiat = React.useMemo(() => {
    if (!isFinite(totalCollateralCapacityUsd) || totalCollateralCapacityUsd <= 0) {
      return 0;
    }

    if (selectedFiat.code === "cNGN") {
      if (cngnPrice > 0) {
        return totalCollateralCapacityUsd / cngnPrice;
      }
      return totalCollateralCapacityUsd;
    }

    if (selectedFiat.code === "NGN") {
      if (usdToNgnRate > 0) {
        return totalCollateralCapacityUsd * usdToNgnRate;
      }
      return totalCollateralCapacityUsd;
    }

    return totalCollateralCapacityUsd;
  }, [totalCollateralCapacityUsd, selectedFiat.code, cngnPrice, usdToNgnRate]);

  // Effective portfolio LTV cap (value-weighted CF across all collateral)
  const effectiveLtv = React.useMemo(() => {
    const { totalValueUsd, capacityUsd } = isExistingMode
      ? existingPositions.reduce(
          (acc, pos) => {
            const sym = pos.symbol.toUpperCase();
            const price = priceBySymbol.get(sym) ?? 0;
            const cf = cfBySymbol.get(sym);
            // Only include if we have collateral factor from API
            if (cf === undefined || cf <= 0) return acc;
            const amt = pos.amount;
            if (!isFinite(amt) || amt <= 0 || price <= 0) return acc;
            const val = amt * price;
            return {
              totalValueUsd: acc.totalValueUsd + val,
              capacityUsd: acc.capacityUsd + val * cf,
            };
          },
          { totalValueUsd: 0, capacityUsd: 0 }
        )
      : collateralLines.reduce(
          (acc, line) => {
            const sym = line.symbol.toUpperCase();
            const price = priceBySymbol.get(sym) ?? 0;
            const cf = cfBySymbol.get(sym);
            // Only include if we have collateral factor from API
            if (cf === undefined || cf <= 0) return acc;
            const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
            if (!isFinite(amt) || amt <= 0 || price <= 0) return acc;
            const val = amt * price;
            return {
              totalValueUsd: acc.totalValueUsd + val,
              capacityUsd: acc.capacityUsd + val * cf,
            };
          },
          { totalValueUsd: 0, capacityUsd: 0 }
        );

    if (!isFinite(totalValueUsd) || totalValueUsd <= 0 || !isFinite(capacityUsd) || capacityUsd <= 0) {
      return 0; // Return 0 if no valid collateral instead of hardcoded value
    }
    return Math.max(0, Math.min(1, capacityUsd / totalValueUsd));
  }, [isExistingMode, existingPositions, collateralLines, priceBySymbol, cfBySymbol]);

  const receiveNumeric = React.useMemo(() => parseFloat((fiatReceive || "").replace(/,/g, "")), [fiatReceive]);
  const hasReceive = Number.isFinite(receiveNumeric) && receiveNumeric > 0;
  const totalCollateralAmount = React.useMemo(() => {
    if (isExistingMode) {
      return existingPositions.reduce((sum, pos) => sum + (isFinite(pos.amount) ? pos.amount : 0), 0);
    }
    return collateralLines.reduce((sum, line) => {
      const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
      if (!isFinite(amt) || amt <= 0) return sum;
      return sum + amt;
    }, 0);
  }, [collateralLines, isExistingMode, existingPositions]);
  const hasCollateral = Number.isFinite(totalCollateralAmount) && totalCollateralAmount > 0;
  const isOverMax = hasReceive && maxLendForCollateral > 0 && receiveNumeric > maxLendForCollateral;
  // For NGN borrowing, also require a linked bank account
  const hasBankAccount = selectedFiat.code === "NGN" ? (bankAccounts.length > 0 && selectedBankId !== null) : true;
  const canBorrow = hasCollateral && hasReceive && !isOverMax && hasBankAccount;

  // Rate derived from tenure (simple interest)
  const tenureRatePercent = React.useMemo(() => tenureDays * BASE_DAILY_RATE * 100, [tenureDays]);
  const interestForTenure = React.useMemo(() => (hasReceive ? receiveNumeric * BASE_DAILY_RATE * tenureDays : 0), [hasReceive, receiveNumeric, tenureDays]);
  const totalRepayForTenure = React.useMemo(() => (hasReceive ? receiveNumeric + interestForTenure : 0), [hasReceive, receiveNumeric, interestForTenure]);
  const overduePerDayAmount = React.useMemo(() => (hasReceive ? receiveNumeric * OVERDUE_DAILY_RATE : 0), [hasReceive, receiveNumeric]);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => {
      setShowTopShadow(el.scrollTop > 0);
      setShowBottomShadow(el.scrollTop + el.clientHeight < el.scrollHeight);
    };
    update();
    el.addEventListener("scroll", update, { passive: true } as AddEventListenerOptions);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update as EventListener);
      ro.disconnect();
    };
  }, [collateralExpanded]);

  async function handleConfirmNewCollateralCngn() {
    if (!canBorrow) {
      setSummaryOpen(false);
      return;
    }

    const lines = collateralLines
      .map((line) => {
        const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
        return { symbol: line.symbol, amount: amt };
      })
      .filter((l) => Number.isFinite(l.amount) && l.amount > 0);

    if (!lines.length) {
      setSummaryOpen(false);
      return;
    }

    setSummaryOpen(false);
    setFailedOpen(false);
    setSuccessOpen(false);
    setIsProcessingBorrow(true);
    setConfirmingOpen(true);

    try {
      const collateralAddresses = new Set<string>();

      for (const line of lines) {
        const resolved = resolveCollateralToken(line.symbol);
        if (!resolved) {
          // Skip tokens we can't resolve from wallet balances
          continue;
        }

        const amountUnits = toSmallestUnits(String(line.amount), resolved.decimals);
        if (amountUnits === "0") continue;

        await depositCollateral({
          tokenAddress: resolved.tokenAddress,
          amount: amountUnits,
          chainId: resolved.chainIdHex,
        });

        collateralAddresses.add(resolved.tokenAddress);
      }

      const numeric = Number.isFinite(receiveNumeric) && receiveNumeric > 0 ? receiveNumeric : 0;
      const borrowAmountUnits = toSmallestUnits(String(numeric), CNGN_DECIMALS);
      if (borrowAmountUnits === "0") {
        setConfirmingOpen(false);
        setIsProcessingBorrow(false);
        return;
      }

      const tenureSeconds = tenureDays * 24 * 60 * 60;

      const payload: BorrowRequest = {
        tokenAddress: CNGN_BASE_ADDRESS,
        amount: borrowAmountUnits,
        chainId: "0x18", // Test mainnet for cNGN; adjust for your env
        tenureSeconds,
        collaterals: Array.from(collateralAddresses),
        offramp: false,
        currency: "NGN",
        institutionId: "",
      };

      await borrow(payload);
      setConfirmingOpen(false);
      setIsProcessingBorrow(false);
      setSuccessOpen(true);
    } catch (e) {
      console.error("Borrow flow failed", e);
      setConfirmingOpen(false);
      setIsProcessingBorrow(false);
      setFailedOpen(true);
    }
  }

  async function handleConfirmNgnBorrow() {
    if (!canBorrow || !selectedBankId) {
      setSummaryOpen(false);
      setBankOpen(false);
      return;
    }

    setBankOpen(false);
    setFailedOpen(false);
    setSuccessOpen(false);
    setIsProcessingBorrow(true);
    setConfirmingOpen(true);

    try {
      // For new collateral mode, deposit collateral first
      if (!isExistingMode) {
        const lines = collateralLines
          .map((line) => {
            const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
            return { symbol: line.symbol, amount: amt };
          })
          .filter((l) => Number.isFinite(l.amount) && l.amount > 0);

        if (lines.length > 0) {
          for (const line of lines) {
            const resolved = resolveCollateralToken(line.symbol);
            if (!resolved) continue;

            const amountUnits = toSmallestUnits(String(line.amount), resolved.decimals);
            if (amountUnits === "0") continue;

            await depositCollateral({
              tokenAddress: resolved.tokenAddress,
              amount: amountUnits,
              chainId: resolved.chainIdHex,
            });
          }
        }
      }

      // Collect collateral addresses
      const collateralAddresses = new Set<string>();
      
      if (isExistingMode) {
        // From existing positions
        if (collateralPosition.data) {
          Object.values(collateralPosition.data).forEach((list) => {
            (list || []).forEach((asset: CollateralPosition) => {
              const raw = Number(asset.amount);
              const cfNum = Number(asset.cf) || 0;
              const addr = String(asset.address || "").toLowerCase();
              if (!Number.isFinite(raw) || raw <= 0) return;
              if (cfNum <= 0) return;
              if (!addr) return;
              collateralAddresses.add(addr);
            });
          });
        }
      } else {
        // From new collateral lines
        collateralLines.forEach((line) => {
          const resolved = resolveCollateralToken(line.symbol);
          if (resolved) {
            collateralAddresses.add(resolved.tokenAddress);
          }
        });
      }

      // Convert NGN amount to cNGN units
      // Formula: NGN amount → USD → cNGN units
      const ngnAmount = Number.isFinite(receiveNumeric) && receiveNumeric > 0 ? receiveNumeric : 0;
      if (ngnAmount <= 0) {
        setConfirmingOpen(false);
        setIsProcessingBorrow(false);
        return;
      }

      let cngnAmount: number;
      if (usdToNgnRate > 0 && cngnPrice > 0) {
        // Convert NGN → USD → cNGN
        const usdAmount = ngnAmount / usdToNgnRate;
        cngnAmount = usdAmount / cngnPrice;
      } else if (cngnPrice > 0) {
        // Fallback: assume 1 NGN = 1 cNGN if rates unavailable
        cngnAmount = ngnAmount / cngnPrice;
      } else {
        // Last resort: assume 1:1 ratio
        cngnAmount = ngnAmount;
      }

      const borrowAmountUnits = toSmallestUnits(String(cngnAmount), CNGN_DECIMALS);
      if (borrowAmountUnits === "0") {
        setConfirmingOpen(false);
        setIsProcessingBorrow(false);
        return;
      }

      const tenureSeconds = tenureDays * 24 * 60 * 60;

      const payload: BorrowRequest = {
        tokenAddress: CNGN_BASE_ADDRESS,
        amount: borrowAmountUnits,
        chainId: "0x18", // Test chain for cNGN; adjust for your env
        tenureSeconds,
        collaterals: Array.from(collateralAddresses),
        offramp: true,
        currency: "NGN",
        institutionId: selectedBankId,
      };

      await borrow(payload);
      setConfirmingOpen(false);
      setIsProcessingBorrow(false);
      setSuccessOpen(true);
    } catch (e) {
      console.error("NGN Borrow flow failed", e);
      setConfirmingOpen(false);
      setIsProcessingBorrow(false);
      setFailedOpen(true);
    }
  }

  async function handleConfirmExistingCngnBorrow() {
    if (!canBorrow) {
      setSummaryOpen(false);
      return;
    }

    setSummaryOpen(false);
    setFailedOpen(false);
    setSuccessOpen(false);
    setIsProcessingBorrow(true);
    setConfirmingOpen(true);

    try {
      // Collect all collateral token addresses from backend positions
      const collateralAddresses = new Set<string>();
      if (collateralPosition.data) {
        Object.values(collateralPosition.data).forEach((list) => {
          (list || []).forEach((asset: CollateralPosition) => {
            const raw = Number(asset.amount);
            const cfNum = Number(asset.cf) || 0;
            const addr = String(asset.address || "").toLowerCase();
            if (!Number.isFinite(raw) || raw <= 0) return;
            if (cfNum <= 0) return;
            if (!addr) return;
            collateralAddresses.add(addr);
          });
        });
      }

      const numeric = Number.isFinite(receiveNumeric) && receiveNumeric > 0 ? receiveNumeric : 0;
      const borrowAmountUnits = toSmallestUnits(String(numeric), CNGN_DECIMALS);
      if (borrowAmountUnits === "0") {
        setConfirmingOpen(false);
        setIsProcessingBorrow(false);
        return;
      }

      const tenureSeconds = tenureDays * 24 * 60 * 60;

      const payload: BorrowRequest = {
        tokenAddress: CNGN_BASE_ADDRESS,
        amount: borrowAmountUnits,
        chainId: "0x18", // Test chain for cNGN; adjust for your env
        tenureSeconds,
        collaterals: Array.from(collateralAddresses),
        offramp: false,
        currency: "NGN",
        institutionId: "",
      };

      await borrow(payload);
      setConfirmingOpen(false);
      setIsProcessingBorrow(false);
      setSuccessOpen(true);
    } catch (e) {
      console.error("Borrow flow failed (existing collateral)", e);
      setConfirmingOpen(false);
      setIsProcessingBorrow(false);
      setFailedOpen(true);
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-dvh">
        <main className="px-3 text-left" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav />
        </div>
        <section className="mt-4 space-y-6 pb-24 sm:pb-28">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[18px] font-semibold">I want to Collateralize</div>
              <button
                type="button"
                onClick={() => setCollateralExpanded((v) => !v)}
                className="inline-flex items-center gap-1 rounded-[10px] border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-700 cursor-pointer hover:bg-gray-50"
              >
                {collateralExpanded ? (
                  <>
                    <span>Collapse</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </>
                )}
              </button>
            </div>

            {/* Existing portfolio summary (backend positions) */}
            {isExistingMode && collateralExpanded && (
              <div className="mt-2 rounded-[16px] border border-gray-200 bg-white p-3">
                <div className="text-[14px] text-gray-600">Collateral source</div>
                <div className="mt-1 text-[14px] font-semibold text-gray-900">Existing portfolio</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {existingPositions.map((pos, idx) => {
                    const asset = assets.find((a) => a.symbol === pos.symbol);
                    if (!asset) return null;
                    return (
                      <div key={`${pos.symbol}-${idx}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-800">
                        <Image src={asset.icon} alt={asset.symbol} width={16} height={16} />
                        <span className="font-medium">{asset.symbol}</span>
                        <span>{formatNumber(pos.amount, 4)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-[13px] text-[#2200FF] underline underline-offset-4 cursor-pointer"
                    onClick={() => {
                      router.push("/vault");
                    }}
                  >
                    Manage collateral
                  </button>
                </div>
              </div>
            )}

            {isExistingMode && !collateralExpanded && (
              <div className="mt-2 flex items-center gap-2 overflow-x-auto">
                {existingPositions.map((pos, idx) => {
                  const asset = assets.find((a) => a.symbol === pos.symbol);
                  if (!asset) return null;
                  return (
                    <div
                      key={`${pos.symbol}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-800"
                    >
                      <Image src={asset.icon} alt={asset.symbol} width={16} height={16} />
                      <span className="font-medium">{asset.symbol}</span>
                      <span>{formatNumber(pos.amount, 4)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {!isExistingMode && !collateralExpanded && (
              <div className="mt-2 flex items-center gap-2 overflow-x-auto">
                {collateralLines.map((line, idx) => {
                  const asset = assets.find((a) => a.symbol === line.symbol);
                  if (!asset) return null; // Skip if asset not found
                  const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
                  return (
                    <div key={`${line.symbol}-${idx}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-800">
                      <Image src={asset.icon} alt={asset.symbol} width={16} height={16} />
                      <span className="font-medium">{asset.symbol}</span>
                      <span>{Number.isFinite(amt) && amt > 0 ? amt : 0}</span>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCollateralExpanded(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-800 cursor-pointer hover:bg-gray-50"
                >
                  <Image src="/icons/plus.svg" alt="Add" width={14} height={14} />
                  Manage
                </button>
              </div>
            )}

            {!isExistingMode && collateralExpanded && (<>
              <div className="relative">
                <div ref={listRef} className="mt-2 space-y-4 max-h-[160px] overflow-y-auto pr-1 u-shadow-inner scrollbar-fancy">
                {collateralLines.map((line, idx) => {
                  const asset = assets.find((a) => a.symbol === line.symbol);
                  if (!asset) return null; // Skip if asset not found
                  const sym = asset.symbol.toUpperCase();
                  const walletBal = balanceBySymbol.get(sym) ?? 0;
                  const price = priceBySymbol.get(sym) ?? 0;
                  const balanceUsd = walletBal * price;
                  return (
                    <div key={`${line.symbol}-${idx}`}>
                      <CustomInput
                        value={line.amount}
                        onChange={(v) => {
                          setCollateralLines((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], amount: v };
                            return next;
                          });
                        }}
                        tokenLabel={asset.symbol}
                        tokenIconSrc={asset.icon}
                        onDropdownClick={() => { setAssetRowIndex(idx); setAssetModalOpen(true); }}
                      />
                      <div className="mt-2 flex items-center justify-between text-[14px] text-gray-500">
                        <div>
                          Balance: {formatNumber(walletBal, 2)} {asset.symbol}
                          <span className="ml-2">≈ ${formatNumber(balanceUsd, 2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {collateralLines.length > 1 && (
                            <button
                              type="button"
                              className="flex items-center gap-1.5 text-red-500 cursor-pointer"
                              onClick={() => {
                                setCollateralLines((prev) => prev.filter((_, i) => i !== idx));
                              }}
                            >
                              <Image src="/settings/trash.svg" alt="Remove" width={14} height={14} />
                              Remove
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-[#2200FF] cursor-pointer"
                            onClick={() => handleMaxCollateral(idx)}
                          >
                            Max
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
                {showTopShadow && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white to-transparent" />
                )}
                {showBottomShadow && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const used = new Set(collateralLines.map((l) => l.symbol));
                    const nextAsset = assets.find((a) => !used.has(a.symbol));
                    if (!nextAsset) return; // all used
                    setCollateralLines((prev) => [...prev, { symbol: nextAsset.symbol, amount: "" }]);
                  }}
                  disabled={assets.every((a) => collateralLines.some((l) => l.symbol === a.symbol))}
                  className={`inline-flex items-center gap-2 rounded-[12px] border px-3 py-2 text-[14px] font-medium ${assets.every((a) => collateralLines.some((l) => l.symbol === a.symbol)) ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" : "border-gray-200 bg-white text-gray-800 cursor-pointer hover:bg-gray-50"}`}
                >
                  <Image src="/icons/plus.svg" alt="Add" width={18} height={18} />
                  Add collateral
                </button>
              </div>
            </>)}
          </div>

          <div>
            <div className="text-[18px] font-semibold">To receive</div>
            {selectedFiat.code === "NGN" && bankAccounts.length === 0 && !isLoadingLinkedAccounts && (
              <div className="mt-2 rounded-[14px] border border-yellow-200 bg-yellow-50 px-3 py-2 text-[12px] text-yellow-800">
                <div className="font-medium">No bank account linked</div>
                <div className="mt-1">
                  Please{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/settings/linked/add")}
                    className="text-[#2200FF] underline underline-offset-2"
                  >
                    add a bank account
                  </button>
                  {" "}to borrow NGN.
                </div>
              </div>
            )}
            {selectedFiat.code === "NGN" && isLoadingLinkedAccounts && (
              <div className="mt-2 text-[12px] text-gray-500">Loading bank accounts...</div>
            )}
            <div className="mt-2">
              <CustomInput
                value={fiatReceive}
                onChange={(v) => { setFiatReceive(v); }}
                tokenLabel={selectedFiat.code}
                tokenIconSrc={selectedFiat.icon}
                onDropdownClick={() => setFiatModalOpen(true)}
                invalid={isOverMax}
              />
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-[14px] text-gray-500">
                <div>
                  Available to borrow: <span className="font-semibold text-[#2200FF]">{formatFiat(selectedFiat.code, maxLendForCollateral)}</span>
                </div>
                <button type="button" className="text-[#2200FF] cursor-pointer" onClick={handleMaxReceive}>Max</button>
              </div>
              {existingDebtInFiat > 0 && (
                <div className="flex items-center justify-between text-[12px] text-gray-400">
                  <div>
                    Max capacity: <span className="font-medium text-gray-600">{formatFiat(selectedFiat.code, maxCapacityInFiat)}</span>
                  </div>
                  <div>
                    Already borrowed: <span className="font-medium text-gray-600">{formatFiat(selectedFiat.code, existingDebtInFiat)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasCollateral && (
            <div className="rounded-[16px] border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between text-[14px]">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Loan To Value (LTV)</span>
                  <button type="button" aria-label="What is LTV?" className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer" onClick={() => setLtvInfoOpen(true)}>
                    <Image src="/icons/info.svg" alt="Info" width={18} height={18} />
                  </button>
                </div>
                <div className="font-semibold text-amber-600">{Math.round(effectiveLtv * 100)}%</div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <div className="text-gray-600">Borrow Limit</div>
                <LtvUsageText value={fiatReceive} max={maxLendForCollateral} code={selectedFiat.code} />
              </div>
              <div className="mt-2">
                <HealthBar percentage={computeLtvUsagePercent(fiatReceive, maxLendForCollateral)} />
              </div>
              {/* <div className="mt-3 flex items-center justify-between text-[14px]">
                <div className="text-gray-600">Rate</div>
                <div className="font-semibold">{formatNumber(tenureRatePercent, 2)}%</div>
              </div> */}
            </div>
          )}

          {/* Tenure and Info section */}
          {hasReceive && (
            <div className="rounded-[16px] border border-gray-200 bg-white p-4">
              <div className="text-[14px] text-gray-600">Tenure</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {TENURES.map((d) => {
                  const active = d === tenureDays;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTenureDays(d)}
                      className={`rounded-full px-3 py-1.5 text-[13px] ${active ? "bg-[#2200FF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      {d} days
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
                <div className="text-gray-600">Rate for tenure</div>
                <div className="text-right font-semibold">{formatNumber(tenureRatePercent, 2)}%</div>
                <div className="text-gray-600">Interest ({tenureDays}d)</div>
                <div className="text-right font-semibold">{formatFiat(selectedFiat.code, interestForTenure)}</div>
                <div className="text-gray-600">Total to repay in {tenureDays}d</div>
                <div className="text-right font-semibold">{formatFiat(selectedFiat.code, totalRepayForTenure)}</div>
              </div>

              <div className="mt-3 rounded-[12px] bg-[#FFF7D6] p-3 text-[13px] text-gray-700">
                After {tenureDays} days, an extra {formatNumber(OVERDUE_DAILY_RATE * 100, 3)}% per day applies. That’s about {formatFiat(selectedFiat.code, overduePerDayAmount)} extra for each late day.
              </div>
            </div>
          )}
        </section>

        {/* Token select modal */}
        <Modal open={assetModalOpen} onClose={() => setAssetModalOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select token</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {assets.length === 0 ? (
                <div className="px-3 py-6 text-center text-[14px] text-gray-500">
                  No collateral assets available. Make sure you have tokens in your wallet that are whitelisted as collateral.
                </div>
              ) : (
                assets.map((a) => {
                  const active = assetRowIndex !== null && collateralLines[assetRowIndex]?.symbol === a.symbol;
                  const usedElsewhere = collateralLines.some((l, i) => i !== assetRowIndex && l.symbol === a.symbol);
                  const disabled = usedElsewhere || active; // already selected elsewhere or same as current
                  return (
                    <button
                      key={a.symbol}
                      type="button"
                      onClick={() => {
                        if (disabled) return;
                        if (assetRowIndex !== null) {
                          setCollateralLines((prev) => {
                            const next = [...prev];
                            next[assetRowIndex] = { ...next[assetRowIndex], symbol: a.symbol };
                            return next;
                          });
                          setAssetRowIndex(null);
                        }
                        setAssetModalOpen(false);
                      }}
                      aria-disabled={disabled}
                      className={`flex w-full items-center gap-3 px-3 py-3 text-left ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 cursor-pointer"} ${active ? "bg-gray-50" : ""}`}
                    >
                      <Image src={a.icon} alt={a.symbol} width={28} height={28} />
                      <div className="flex-1">
                        <div className="text-[14px] font-medium">{a.name} ({a.symbol})</div>
                      </div>
                      {active && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </Modal>

        {/* Fiat select modal */}
        <Modal open={fiatModalOpen} onClose={() => setFiatModalOpen(false)}>
          <div className="space-y-3">
            <div className="text-[18px] font-semibold">Select fiat</div>
            <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
              {fiats.map((f) => {
                const active = f.code === selectedFiat.code;
                return (
                  <button
                    key={f.code}
                    type="button"
                    onClick={() => { setSelectedFiat(f); setFiatModalOpen(false); }}
                    className={`flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50 ${active ? "bg-gray-50" : ""}`}
                  >
                    <Image src={f.icon} alt={f.code} width={28} height={28} />
                    <div className="flex-1">
                      <div className="text-[14px] font-medium">{f.name} ({f.code})</div>
                    </div>
                    {active && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>

        {/* LTV info modal */}
        <Modal open={ltvInfoOpen} onClose={() => setLtvInfoOpen(false)}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-[22px] font-semibold leading-6">What is LTV?</div>
              <button type="button" aria-label="Close" onClick={() => setLtvInfoOpen(false)} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-[16px] leading-7 text-gray-700">
              Loan to Value (LTV) is the ratio between the value of your borrowed funds and the USD value of your collateral. A higher LTV means you’re borrowing closer to the maximum against your collateral and may have higher liquidation risk if prices move.
            </p>
          </div>
        </Modal>

        {/* Bottom action bar */}
        <div className="fixed inset-x-0 z-10 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button
              type="button"
              disabled={!canBorrow}
              className={`w-full rounded-[20px] px-4 py-3 text-[14px] font-medium text-center ${canBorrow ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              onClick={() => { if (canBorrow) setSummaryOpen(true); }}
            >
              Borrow
            </button>
          </div>
        </div>
      </main>

      {/* Borrow Summary modal */}
      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)}>
        <BorrowSummary
          onClose={() => setSummaryOpen(false)}
          onConfirm={() => {
            if (isCngnOnchain) {
              if (isExistingMode) {
                void handleConfirmExistingCngnBorrow();
              } else {
                void handleConfirmNewCollateralCngn();
              }
              return;
            }
            // For NGN, check if user has linked accounts
            if (bankAccounts.length === 0) {
              // No linked accounts - show error or redirect to add account
              setSummaryOpen(false);
              // Could show a modal here or redirect
              router.push("/settings/linked/add");
              return;
            }
            setSummaryOpen(false);
            setBankOpen(true);
          }}
          collaterals={
            (isExistingMode
              ? existingPositions
                  .map((pos): { symbol: string; amount: number; icon?: string } | null => {
                  const asset = assets.find((a) => a.symbol === pos.symbol);
                  if (!asset) return null;
                  const amt = typeof pos.amount === "number" ? pos.amount : parseFloat(String(pos.amount || "0").replace(/,/g, ""));
                  return { symbol: asset.symbol, amount: isFinite(amt) ? amt : 0, icon: asset.icon };
                  })
                  .filter((c): c is { symbol: string; amount: number; icon?: string } => c !== null)
              : collateralLines
                  .map((line): { symbol: string; amount: number; icon?: string } | null => {
                    const asset = assets.find((a) => a.symbol === line.symbol);
                    if (!asset) return null; // Skip if asset not found
                    const amt = parseFloat((line.amount || "0").replace(/,/g, ""));
                    return { symbol: asset.symbol, amount: isFinite(amt) ? amt : 0, icon: asset.icon };
                  })
                  .filter((c): c is { symbol: string; amount: number; icon?: string } => c !== null)
            ) as Array<{ symbol: string; amount: number; icon?: string }>
          }
          receiveAmount={Number.isFinite(receiveNumeric) ? receiveNumeric : 0}
          fiatCode={selectedFiat.code}
          ltvPercent={Math.round(effectiveLtv * 100)}
          tenureDays={tenureDays}
          baseDailyRate={BASE_DAILY_RATE}
          overdueDailyRate={OVERDUE_DAILY_RATE}
        />
      </Modal>

      {/* Bank selection step */}
      <BankSelectModal
        open={bankOpen}
        onClose={() => setBankOpen(false)}
        accounts={bankAccounts}
        selectedId={selectedBankId}
        onSelect={setSelectedBankId}
        onAddBank={() => {
          setBankOpen(false);
          router.push("/settings/linked/add");
        }}
        onConfirmBorrow={() => {
          // Call the actual NGN borrow handler
          void handleConfirmNgnBorrow();
        }}
      />

      {/* Borrow confirming modal */}
      <BorrowConfirmingModal
        open={confirmingOpen}
        onClose={() => setConfirmingOpen(false)}
        amountLabel={`${selectedFiat.code} ${formatNumber(receiveNumeric || 0)}`}
        progress={confirmProgress}
      />

      {/* Borrow success modal */}
      <BorrowSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        onViewReceipt={() => {
          setSuccessOpen(false);
          // Optional: route to receipt page
        }}
        amountLabel={`${selectedFiat.code} ${formatNumber(receiveNumeric || 0)}`}
      />

      {/* Borrow failed modal */}
      <BorrowFailedModal
        open={failedOpen}
        onClose={() => setFailedOpen(false)}
        onRetry={() => {
          setFailedOpen(false);
          setSummaryOpen(true);
        }}
      />
    </div>
  );
}

function LtvUsageText({ value, max, code }: { value: string; max: number; code: string }) {
  const pct = Math.round(
    Math.max(0, Math.min(100, (parseFloat((value || "0").replace(/,/g, "")) || 0) / (max || 1) * 100))
  );
  return (
    <div className="text-gray-800 font-medium">{pct}%</div>
  );
}


