"use client";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { ArrowLeftIcon } from "@customIcons";
import React from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import RepayModal from "@/components/repay/RepayModal";
import RepayConfirmingModal from "@/components/repay/RepayConfirmingModal";
import RepayFailedModal from "@/components/repay/RepayFailedModal";
import RepaySuccessModal from "@/components/repay/RepaySuccessModal";
import { CustomInput } from "@/components/inputs";
import Modal from "@/components/ui/Modal";
import useGetActiveLoanPositions, { ActiveLoanPosition } from "@/hooks/vault/useGetActiveLoanPositions";
import { CHAIN_IDS } from "@/utils/constants/chainIds";
import { useNgnConversion } from "@/hooks/useNgnConversion";
import { useTokenPrices } from "@/hooks/prices/useTokenPrices";
import { mapHexChainIdToDextools, makeDextoolsPriceKey } from "@/utils/prices/dextools";
import { useTokenMetadataBatch } from "@/hooks/prices/useTokenMetadata";
import { CNGN_BASE_ADDRESS, CNGN_DECIMALS } from "@/utils/constants/cngn";
import { getTokenDecimals } from "@/utils/constants/tokenDecimals";
import { useRepayLoan } from "@/hooks/vault/useRepayLoan";

export default function RepayLoanDetailPage() {
  const params = useParams();
  const loanId = Number(params.id ?? "");
  const search = useSearchParams();
  const router = useRouter();
  const chainId = search.get("chainId") ?? "";
  const positionId = search.get("positionId") ?? "";
  
  const chainList = React.useMemo(() => Object.values(CHAIN_IDS), []);
  const { data: activeLoansByChain } = useGetActiveLoanPositions(chainList);
  const { convertUsdToNgn } = useNgnConversion();

  // Find the specific loan
  const loan = React.useMemo<ActiveLoanPosition | null>(() => {
    if (!activeLoansByChain || !chainId) return null;
    const loans = activeLoansByChain[chainId];
    if (!loans) return null;
    return loans.find((l) => l.loanId === loanId) ?? null;
  }, [activeLoansByChain, chainId, loanId]);

  // Build price token requests for DEXTools
  const priceTokens = React.useMemo(() => {
    if (!loan || !loan.token) return [];
    const dextoolsChain = mapHexChainIdToDextools(chainId);
    if (!dextoolsChain) return [];
    return [{ chain: dextoolsChain, address: loan.token.toLowerCase() }];
  }, [loan, chainId]);

  const { data: tokenPrices } = useTokenPrices(priceTokens as any);
  const { data: tokenMetadata } = useTokenMetadataBatch(priceTokens as any);

  // Get token details with proper fallback
  const tokenDetails = React.useMemo(() => {
    if (!loan || !loan.token) {
      return { decimals: 18, symbol: "TOKEN", name: "Token" };
    }
    
    // Normalize token address for comparison
    const normalizeAddr = (addr: string) => {
      const cleaned = String(addr).trim().toLowerCase();
      return cleaned.startsWith('0x') ? cleaned : `0x${cleaned}`;
    };
    
    const tokenAddress = normalizeAddr(loan.token);
    const cngnAddress = normalizeAddr(CNGN_BASE_ADDRESS);
    
    // First, check if it's a known token (cNGN)
    if (tokenAddress === cngnAddress) {
      return { decimals: CNGN_DECIMALS, symbol: "cNGN", name: "cNGN" };
    }
    
    // Then try DEXTools metadata
    let metadataDecimals: number | null = null;
    let metadataSymbol: string | null = null;
    let metadataName: string | null = null;
    
    if (tokenMetadata) {
      const dextoolsChain = mapHexChainIdToDextools(chainId);
      if (dextoolsChain) {
        const priceKey = makeDextoolsPriceKey(dextoolsChain, tokenAddress);
        const metadata = tokenMetadata[priceKey];
        
        if (metadata) {
          metadataDecimals = metadata.decimals ?? null;
          metadataSymbol = metadata.symbol ?? null;
          metadataName = metadata.name ?? null;
        }
      }
    }
    
    // Use getTokenDecimals with fallback chain: API -> known by symbol -> known by address -> 18
    const decimals = getTokenDecimals(metadataDecimals, metadataSymbol, tokenAddress);
    
    return {
      decimals,
      symbol: metadataSymbol ?? "TOKEN",
      name: metadataName ?? "Token",
    };
  }, [loan, tokenMetadata, chainId]);

  // Normalize amount from smallest units to human-readable
  function normalizeAmount(raw: string | number, decimals: number): number {
    const n = Number(raw) || 0;
    if (!Number.isFinite(n)) return 0;
    return n / (10 ** decimals);
  }

  // Convert human-readable amount back to smallest units
  function toSmallestUnits(amount: number, decimals: number): string {
    const n = Number(amount) || 0;
    if (!Number.isFinite(n)) return "0";
    const result = BigInt(Math.floor(n * (10 ** decimals)));
    return result.toString();
  }

  // Get token price for calculations
  const tokenPriceUsd = React.useMemo(() => {
    if (!loan?.token || !tokenPrices) return 0;
    const dextoolsChain = mapHexChainIdToDextools(chainId);
    if (!dextoolsChain) return 0;
    
    // Normalize address for price lookup
    const normalizeAddr = (addr: string) => {
      const cleaned = String(addr).trim().toLowerCase();
      return cleaned.startsWith('0x') ? cleaned : `0x${cleaned}`;
    };
    const tokenAddr = normalizeAddr(loan.token);
    
    const priceKey = makeDextoolsPriceKey(dextoolsChain, tokenAddr);
    return tokenPrices[priceKey]?.price ?? 0;
  }, [loan, tokenPrices, chainId]);

  // Calculate debt amount in NGN
  const debtAmount = React.useMemo(() => {
    if (!loan) return 0;
    const normalized = normalizeAmount(loan.debt, tokenDetails.decimals);
    if (tokenPriceUsd > 0) {
      const debtUsd = normalized * tokenPriceUsd;
      return convertUsdToNgn(debtUsd);
    }
    return normalized; // Fallback to token amount if price not available
  }, [loan, tokenDetails, tokenPriceUsd, convertUsdToNgn]);

  // Calculate principal amount in NGN
  const principalAmount = React.useMemo(() => {
    if (!loan) return 0;
    const normalized = normalizeAmount(loan.principal, tokenDetails.decimals);
    if (tokenPriceUsd > 0) {
      const principalUsd = normalized * tokenPriceUsd;
      return convertUsdToNgn(principalUsd);
    }
    return normalized;
  }, [loan, tokenDetails, tokenPriceUsd, convertUsdToNgn]);

  // Calculate repaid amount in NGN
  const repaidAmount = React.useMemo(() => {
    if (!loan) return 0;
    const normalized = normalizeAmount(loan.repaid, tokenDetails.decimals);
    if (tokenPriceUsd > 0) {
      const repaidUsd = normalized * tokenPriceUsd;
      return convertUsdToNgn(repaidUsd);
    }
    return normalized;
  }, [loan, tokenDetails, tokenPriceUsd, convertUsdToNgn]);

  function formatNaira(n: number) {
    return `₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
  }

  // Format amount - show token amount primarily (e.g., "100.00 cNGN")
  const amount = React.useMemo(() => {
    if (!loan) return `0.00 ${tokenDetails.symbol}`;
    const normalized = normalizeAmount(loan.debt, tokenDetails.decimals);
    
    if (normalized > 0) {
      const formatted = normalized >= 1 
        ? normalized.toFixed(2)
        : normalized >= 0.01
        ? normalized.toFixed(4)
        : normalized.toFixed(6);
      return `${formatted} ${tokenDetails.symbol}`;
    }
    
    return `0.00 ${tokenDetails.symbol}`;
  }, [loan, tokenDetails]);
  
  // Also calculate NGN equivalent for display (optional)
  const amountNgn = React.useMemo(() => {
    if (!loan || debtAmount <= 0) return null;
    return formatNaira(debtAmount);
  }, [loan, debtAmount]);
  
  // Format timestamp
  const date = React.useMemo(() => {
    if (!loan?.startTimestamp) return "N/A";
    const dateObj = new Date(loan.startTimestamp * 1000);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString("en-US", { month: "short" });
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${day} ${month} at ${displayHours}:${displayMinutes}${ampm}`;
  }, [loan]);

  // All hooks must be called before any early returns
  const status = React.useMemo(() => {
    if (!loan) return null;
    return loan.status === 1 ? ("pending" as const) : ("paid" as const);
  }, [loan]);
  
  // Calculate outstanding debt in token units (not NGN) for validation
  const outstandingTokenAmount = React.useMemo(() => {
    if (!loan) return 0;
    return normalizeAmount(loan.debt, tokenDetails.decimals);
  }, [loan, tokenDetails.decimals]);
  
  // Calculate outstanding debt in NGN for NGN repayment validation
  const outstandingNgnAmount = React.useMemo(() => {
    if (!loan || debtAmount <= 0) return 0;
    return debtAmount;
  }, [loan, debtAmount]);

  // Repayment currency selection: "cNGN" (token) or "NGN" (fiat via bank transfer)
  const [repayCurrency, setRepayCurrency] = React.useState<"cNGN" | "NGN">("cNGN");
  
  // Initialize repay amount to the debt value when loan loads or currency changes
  const initialRepayAmount = React.useMemo(() => {
    if (!loan) return "";
    if (repayCurrency === "cNGN") {
      // Format the token amount with appropriate precision
      const amount = outstandingTokenAmount;
      if (amount <= 0) return "";
      // Use enough decimals to avoid rounding issues
      if (amount >= 1) {
        return amount.toFixed(6).replace(/\.?0+$/, ""); // Remove trailing zeros
      } else if (amount >= 0.01) {
        return amount.toFixed(6).replace(/\.?0+$/, "");
      } else {
        return amount.toFixed(tokenDetails.decimals).replace(/\.?0+$/, "");
      }
    } else {
      // Format NGN amount
      const amount = outstandingNgnAmount;
      if (amount <= 0) return "";
      return amount.toFixed(2);
    }
  }, [loan, repayCurrency, outstandingTokenAmount, outstandingNgnAmount, tokenDetails.decimals]);
  
  const [repayAmount, setRepayAmount] = React.useState("");
  const repayNumeric = React.useMemo(() => parseFloat((repayAmount || "").replace(/,/g, "")), [repayAmount]);
  
  // Update repay amount when initial value changes (loan loads or currency changes)
  React.useEffect(() => {
    if (initialRepayAmount) {
      setRepayAmount(initialRepayAmount);
    }
  }, [initialRepayAmount]);
  
  // Validation depends on selected currency
  const repayValid = React.useMemo(() => {
    if (!Number.isFinite(repayNumeric) || repayNumeric <= 0) return false;
    if (repayCurrency === "cNGN") {
      return repayNumeric <= outstandingTokenAmount;
    } else {
      return repayNumeric <= outstandingNgnAmount;
    }
  }, [repayNumeric, repayCurrency, outstandingTokenAmount, outstandingNgnAmount]);
  
  const [currencyModalOpen, setCurrencyModalOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const confirmTimerRef = React.useRef<number | null>(null);
  const confirmIntervalRef = React.useRef<number | null>(null);
  const [confirmingProgress, setConfirmingProgress] = React.useState(0);

  // Repay loan mutation
  const repayLoanMutation = useRepayLoan();

  // Convert repayment amount to smallest units
  // If cNGN: user enters token amount, convert to smallest units
  // If NGN: convert NGN -> USD -> token amount -> smallest units
  const repayAmountInSmallestUnits = React.useMemo(() => {
    if (!repayValid || !loan || repayNumeric <= 0) return "0";
    
    if (repayCurrency === "cNGN") {
      // User enters token amount directly (e.g., 100 cNGN), convert to smallest units
      return toSmallestUnits(repayNumeric, tokenDetails.decimals);
    } else {
      // User enters NGN amount, convert to token amount first
      if (tokenPriceUsd > 0) {
        // NGN -> USD -> Token amount
        const ngnToUsdRate = 1 / convertUsdToNgn(1); // Get USD per NGN
        const repayUsd = repayNumeric * ngnToUsdRate;
        const repayTokenAmount = repayUsd / tokenPriceUsd;
        return toSmallestUnits(repayTokenAmount, tokenDetails.decimals);
      }
      // Fallback: assume 1:1 if no price (shouldn't happen)
      return toSmallestUnits(repayNumeric, tokenDetails.decimals);
    }
  }, [repayValid, repayNumeric, loan, repayCurrency, tokenDetails.decimals, tokenPriceUsd, convertUsdToNgn]);

  async function handleRepayLoan() {
    if (!loan || !repayValid || repayAmountInSmallestUnits === "0") return;

    try {
      setConfirming(true);
      setConfirmingProgress(0);
      
      // Simulate progress while API call is in progress
      const progressInterval = window.setInterval(() => {
        setConfirmingProgress((p) => {
          const next = Math.min(p + 2, 90); // Stop at 90% until API responds
          return next;
        });
      }, 50);

      const result = await repayLoanMutation.mutateAsync({
        amount: repayAmountInSmallestUnits,
        chainId: chainId,
        tokenAddress: loan.token,
        loanId: String(loan.loanId),
      });

      // Clear progress interval
      clearInterval(progressInterval);
      setConfirmingProgress(100);

      // Small delay to show 100%
      await new Promise((resolve) => setTimeout(resolve, 200));

      setConfirming(false);
      setSuccess(true);
    } catch (error) {
      setConfirming(false);
      setFailed(true);
      console.error("Repayment failed:", error);
    }
  }

  function startConfirming() {
    // This is called when user clicks "I have sent the money" in RepayModal
    // Now we actually call the API
    handleRepayLoan();
  }

  // Early return if loan not found
  if (!activeLoansByChain) {
    return (
      <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
        <AppHeader
          title="Repay loan"
          fixed
          left={
            <Link href="/repayments" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <ArrowLeftIcon size={18} color="#374151" />
            </Link>
          }
        />
        <div className="mt-6 rounded-2xl bg-white p-6 text-center">
          <div className="text-[16px] font-medium text-gray-600">Loading loan details...</div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
        <AppHeader
          title="Repay loan"
          fixed
          left={
            <Link href="/repayments" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <ArrowLeftIcon size={18} color="#374151" />
            </Link>
          }
        />
        <div className="mt-6 rounded-2xl bg-white p-6 text-center">
          <div className="text-[16px] font-medium text-gray-600">Loan not found</div>
          <div className="mt-2 text-[14px] text-gray-500">The loan you're looking for doesn't exist or has been repaid.</div>
          <Link href="/repayments" className="mt-4 inline-block rounded-[20px] bg-[#2200FF] px-4 py-2 text-[14px] font-medium text-white">
            Back to repayments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
      <AppHeader
        title="Repay loan"
        fixed
        left={
          <Link href="/repayments" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeftIcon size={18} color="#374151" />
          </Link>
        }
      />

      <div className="mx-auto mt-6 w-full max-w-[560px] rounded-2xl bg-white p-4 text-left shadow relative overflow-hidden">
        <div className="text-center">
          <div className="text-[28px] font-semibold tracking-tight">{amount}</div>
          {amountNgn && (
            <div className="mt-1 text-[14px] text-gray-500">≈ {amountNgn}</div>
          )}
          <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-[12px] ${status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>
            {status === "pending" ? "Pending repayment" : "Repayment received"}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Loan Details from API */}
          <Row left="Token" right={tokenDetails.symbol} />
          <Row left="Principal" right={formatNaira(principalAmount)} />
          <Row left="Repaid" right={formatNaira(repaidAmount)} />
          <Row left="Outstanding debt" right={amount} />
          <Row left="Annual rate" right={`${(loan.annualRateBps / 100).toFixed(2)}%`} />
          <Row left="Penalty rate" right={`${(loan.penaltyRateBps / 100).toFixed(2)}%`} />
          <Row left="Tenure" right={`${Math.floor(loan.tenureSecond / 86400)} days`} />
          <Row left="Loan ID" right={String(loan.loanId)} />
          <Row left="Position ID" right={String(loan.positionId)} />
          <Row left="Start date" right={date} />
          
          {/* Commented out - not provided by API */}
          {/* <CollateralRow
            assets={[
              { symbol: "USDT", amount: "20", logo: "/assets/usdt.svg" },
              { symbol: "USDC", amount: "30", logo: "/assets/usdc.svg" },
              { symbol: "BNB", amount: "1.23", logo: "/assets/bnb.svg" },
            ]}
          /> */}
          {/* <Row left="Receiver details" right={"Hodl Pool\nBase Chain  |  0x1234...abcd"} /> */}
          {/* <Row left="Remark" right="Repayment scheduled" /> */}
          {/* <Row left="Transaction type" right="Money borrowed" /> */}
        </div>

        {status !== null && status === "pending" && (
          <div className="mt-6 rounded-[16px] border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between text-[14px]">
              <div className="text-gray-600">Amount to repay</div>
              <button
                type="button"
                className="text-[#2200FF] cursor-pointer"
                onClick={() => {
                  if (repayCurrency === "cNGN") {
                    // Set exact debt amount in token units with proper precision
                    const amount = outstandingTokenAmount;
                    if (amount > 0) {
                      // Use enough decimals to avoid rounding issues
                      if (amount >= 1) {
                        setRepayAmount(amount.toFixed(6).replace(/\.?0+$/, ""));
                      } else if (amount >= 0.01) {
                        setRepayAmount(amount.toFixed(6).replace(/\.?0+$/, ""));
                      } else {
                        setRepayAmount(amount.toFixed(tokenDetails.decimals).replace(/\.?0+$/, ""));
                      }
                    }
                  } else {
                    // Set exact debt amount in NGN
                    const amount = outstandingNgnAmount;
                    if (amount > 0) {
                      setRepayAmount(amount.toFixed(2));
                    }
                  }
                }}
              >
                Max
              </button>
            </div>
            <div className="mt-2">
              <CustomInput
                value={repayAmount}
                onChange={setRepayAmount}
                tokenLabel={repayCurrency}
                tokenIconSrc={repayCurrency === "cNGN" ? "/assets/cngn.svg" : "/fiat/ngn.svg"}
                onDropdownClick={() => setCurrencyModalOpen(true)}
                invalid={Boolean(repayAmount) && !repayValid}
              />
            </div>
            <div className="mt-2 text-[12px] text-gray-600">
              Outstanding: <span className="font-medium">
                {repayCurrency === "cNGN" ? amount : (amountNgn || "₦0.00")}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 z-10 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
        <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          {status === "pending" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (repayCurrency === "cNGN") {
                    // For cNGN: call API directly, skip bank transfer modal
                    handleRepayLoan();
                  } else {
                    // For NGN: show bank transfer modal first
                    setOpen(true);
                  }
                }}
                disabled={!repayValid || repayLoanMutation.isPending}
                className={`w-full rounded-[20px] px-4 py-3 text-[14px] font-medium text-center ${repayValid && !repayLoanMutation.isPending ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              >
                {repayLoanMutation.isPending ? "Processing..." : "Repay now"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/repayments" className="w-full rounded-[20px] bg-gray-200 px-4 py-3 text-[14px] font-medium text-center">Done</Link>
            </div>
          )}
        </div>
      </div>

      {status === "pending" && (
        <>
          {/* Currency selection modal */}
          <Modal open={currencyModalOpen} onClose={() => setCurrencyModalOpen(false)}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[18px] font-semibold">Select repayment currency</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setCurrencyModalOpen(false)}
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setRepayCurrency("cNGN");
                    setRepayAmount("");
                    setCurrencyModalOpen(false);
                  }}
                  className={`w-full rounded-[16px] border-2 p-4 text-left transition-colors ${
                    repayCurrency === "cNGN"
                      ? "border-[#2200FF] bg-[#2200FF]/5"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200">
                      <Image src="/assets/cngn.svg" alt="cNGN" width={24} height={24} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[16px] font-semibold">cNGN</div>
                      <div className="text-[12px] text-gray-500">Pay with token</div>
                    </div>
                    {repayCurrency === "cNGN" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#2200FF]">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRepayCurrency("NGN");
                    setRepayAmount("");
                    setCurrencyModalOpen(false);
                  }}
                  className={`w-full rounded-[16px] border-2 p-4 text-left transition-colors ${
                    repayCurrency === "NGN"
                      ? "border-[#2200FF] bg-[#2200FF]/5"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200">
                      <Image src="/fiat/ngn.svg" alt="NGN" width={24} height={24} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[16px] font-semibold">NGN</div>
                      <div className="text-[12px] text-gray-500">Pay via bank transfer</div>
                    </div>
                    {repayCurrency === "NGN" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#2200FF]">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </Modal>

          {/* RepayModal only shown for NGN (fiat) repayment via bank transfer */}
          {repayCurrency === "NGN" && (
            <RepayModal
              open={open}
              onClose={() => setOpen(false)}
              amount={repayValid ? formatNaira(repayNumeric) : (amountNgn || "₦0.00")}
              accountNumber="0123498765"
              bankName="Paystack-Titan Bank"
              accountName="PAYSTACK-PAYOUT"
              seconds={30 * 60}
              onConfirmSent={startConfirming}
              onCancelConfirmed={() => {
                setOpen(false);
                setFailed(true);
              }}
            />
          )}
          <RepayConfirmingModal
            open={confirming}
            onClose={() => setConfirming(false)}
            amount={
              repayValid
                ? repayCurrency === "cNGN"
                  ? `${repayNumeric.toFixed(2)} ${tokenDetails.symbol}`
                  : formatNaira(repayNumeric)
                : repayCurrency === "cNGN"
                ? amount
                : (amountNgn || "₦0.00")
            }
            progress={confirmingProgress}
            isTokenPayment={repayCurrency === "cNGN"}
          />
          <RepayFailedModal
            open={failed}
            onClose={() => setFailed(false)}
            title={repayLoanMutation.error ? "Repayment failed" : "Payment cancelled"}
            message={
              repayLoanMutation.error
                ? repayLoanMutation.error.message || "Failed to process repayment. Please try again."
                : "You closed the repayment flow. You can try again whenever you're ready."
            }
            onRetry={() => {
              setFailed(false);
              if (repayLoanMutation.error) {
                // Retry the API call
                handleRepayLoan();
              } else {
                // Reopen the modal
                setOpen(true);
              }
            }}
          />
           <RepaySuccessModal
             open={success}
             onClose={() => {
               setSuccess(false);
               router.push("/repayments");
             }}
             amount={
               repayValid
                 ? repayCurrency === "cNGN"
                   ? `${repayNumeric.toFixed(2)} ${tokenDetails.symbol}`
                   : formatNaira(repayNumeric)
                 : repayCurrency === "cNGN"
                 ? amount
                 : (amountNgn || "₦0.00")
             }
             onViewReceipt={() => {
               setSuccess(false);
               router.push(`/home/transactions/${loanId}?type=repaid&status=success`);
             }}
           />
        </>
      )}
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-[14px] font-medium text-gray-500">{left}</div>
      <div className="text-right text-[14px] whitespace-pre-line">{right}</div>
    </div>
  );
}

function CollateralRow({ assets }: { assets: { symbol: string; amount: string; logo: string }[] }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-[14px] font-medium text-gray-500">Collateralized assets</div>
      <div className="flex flex-wrap justify-end gap-2">
        {assets.map((a) => (
          <span key={`${a.symbol}-${a.amount}`} className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-[12px] text-gray-800">
            <Image src={a.logo} alt={a.symbol} width={16} height={16} className="rounded-full" />
            <span>
              {a.amount}
              {a.symbol}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
