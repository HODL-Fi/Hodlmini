"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { CustomInput } from "@/components/inputs";
import { useDepositCollateral } from "@/hooks/vault/useDepositCollateral";
import { useWithdrawCollateral } from "@/hooks/vault/useWithdrawCollateral";
import { getTokenDecimals } from "@/utils/constants/tokenDecimals";
import ProcessingModal from "@/components/wallet/ProcessingModal";
import TxSuccessModal from "@/components/wallet/TxSuccessModal";

type Position = { symbol: string; amount: number };

type WalletAssetLike = {
  symbol: string;
  icon: string;
  price: number;
  address: string;
  chainIdHex: string;
  decimals: number;
  chainKey: string;
};

type Props = {
  open: boolean;
  mode: "deposit" | "withdraw";
  position: Position | null;
  walletAsset: WalletAssetLike | undefined;
  walletBalance: number;
  editValue: string;
  onChangeEditValue: (value: string) => void;
  formatAmount: (n: number) => string;
  formatUsd: (n: number) => string;
  onClose: () => void;
};

function toUnitAmount(amount: string, decimals: number): string {
  const safe = (amount || "").trim();
  if (!safe) return "0";
  // Remove all commas (thousand separators) first, then handle decimal point
  const withoutCommas = safe.replace(/,/g, "");
  const [wholeRaw, fracRaw = ""] = withoutCommas.split(".");
  const whole = wholeRaw === "" ? "0" : wholeRaw;
  const fracPadded = (fracRaw + "0".repeat(decimals)).slice(0, decimals);
  try {
    const asBigInt = BigInt(whole + fracPadded);
    return asBigInt.toString();
  } catch {
    return "0";
  }
}

export default function VaultEditPositionModal({
  open,
  mode,
  position,
  walletAsset,
  walletBalance,
  editValue,
  onChangeEditValue,
  formatAmount,
  formatUsd,
  onClose,
}: Props) {
  const { mutateAsync: depositCollateral, isPending: isDepositing } =
    useDepositCollateral();
  const { mutateAsync: withdrawCollateral, isPending: isWithdrawing } =
    useWithdrawCollateral();

  const [processingOpen, setProcessingOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [successAmount, setSuccessAmount] = React.useState<string>("");

  const symbol = position?.symbol ?? "";
  const numeric = parseFloat((editValue || "0").replace(/,/g, ""));
  const isNumber = Number.isFinite(numeric) && numeric > 0;
  const canConfirm =
    !!position && isNumber && (mode === "deposit" || numeric <= position.amount);
  const maxWithdraw = position?.amount ?? 0;
  const unitPrice = walletAsset?.price ?? 0;
  const inputUsdValue = isNumber ? numeric * unitPrice : 0;

  const isLoading = mode === "deposit" ? isDepositing : isWithdrawing;

  async function handleConfirm() {
    if (!canConfirm || !position) return;

    // Real deposit path
    if (mode === "deposit") {
      if (!walletAsset || !walletAsset.address || !walletAsset.chainIdHex) return;

      const amountUnits = toUnitAmount(editValue || "0", getTokenDecimals(walletAsset.decimals, walletAsset.symbol, walletAsset.address));
      if (amountUnits === "0") return;

      const amountToShow = formatAmount(numeric);
      setSuccessAmount(amountToShow);
      setProcessingOpen(true);
      try {
        await depositCollateral({
          tokenAddress: walletAsset.address,
          amount: amountUnits,
          chainId: walletAsset.chainIdHex,
        });
        setProcessingOpen(false);
        onChangeEditValue("");
        // Don't close edit modal yet - let success modal show first
        setSuccessOpen(true);
      } catch {
        setProcessingOpen(false);
        // Keep modal open on error; caller can add a toast
      }
      return;
    }

    // Real withdraw path
    if (mode === "withdraw") {
      if (!walletAsset || !walletAsset.address || !walletAsset.chainIdHex) return;

      const amountUnits = toUnitAmount(editValue || "0", getTokenDecimals(walletAsset.decimals, walletAsset.symbol, walletAsset.address));
      if (amountUnits === "0") return;

      const amountToShow = formatAmount(numeric);
      setSuccessAmount(amountToShow);
      setProcessingOpen(true);
      try {
        await withdrawCollateral({
          tokenAddress: walletAsset.address,
          amount: amountUnits,
          chainId: walletAsset.chainIdHex,
        });
        setProcessingOpen(false);
        onChangeEditValue("");
        // Don't close edit modal yet - let success modal show first
        setSuccessOpen(true);
      } catch {
        setProcessingOpen(false);
        // Keep modal open on error; caller can add a toast
      }
    }
  }

  const formattedAmount = isNumber ? formatAmount(numeric) : "";
  const displayAmount = successAmount || formattedAmount;
  const successMessage = mode === "deposit" 
    ? <>Your deposit of <span className="font-semibold text-gray-900">{displayAmount} {symbol}</span> was processed successfully.</>
    : <>Your withdrawal of <span className="font-semibold text-gray-900">{displayAmount} {symbol}</span> was processed successfully.</>;

  return (
    <>
      <Modal open={open && !successOpen} onClose={onClose}>
        {open && position && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-[18px] font-semibold">
                {mode === "deposit" ? "Deposit" : "Withdraw"}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
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

            <CustomInput
              value={editValue}
              onChange={onChangeEditValue}
              tokenLabel={symbol}
              tokenIconSrc={walletAsset?.icon}
            />

            <div className="mt-1 flex items-center justify-between text-[12px] text-gray-600">
              <div className="flex flex-col">
                <div className="text-[12px] text-gray-500">
                  ≈{" "}
                  <span className="font-medium">
                    {formatUsd(inputUsdValue)}
                  </span>
                </div>
                {mode === "withdraw" ? (
                  <div>
                    Available in vault:{" "}
                    <span className="font-medium">{position.amount}</span>{" "}
                    {symbol}
                  </div>
                ) : (
                  <div>
                    Wallet balance:{" "}
                    <span className="font-medium">
                      {formatAmount(walletBalance)} {symbol}
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="text-[#2200FF] cursor-pointer"
                onClick={() => {
                  const maxValue =
                    mode === "withdraw" ? maxWithdraw : walletBalance;
                  onChangeEditValue(maxValue ? String(maxValue) : "");
                }}
              >
                Max
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canConfirm || isLoading}
                className={`w-1/2 rounded-[14px] px-4 py-3 text-[14px] font-medium text-white ${
                  canConfirm && !isLoading
                    ? "bg-[#2200FF] cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={handleConfirm}
              >
                {isLoading
                  ? mode === "deposit"
                    ? "Depositing..."
                    : "Withdrawing..."
                  : mode === "deposit"
                    ? "Deposit"
                    : "Withdraw"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ProcessingModal
        open={processingOpen}
        onClose={() => setProcessingOpen(false)}
        title={mode === "deposit" ? "Processing deposit" : "Processing withdrawal"}
        hint={mode === "deposit" 
          ? `We're finalizing your deposit of ${displayAmount} ${symbol}. This won't take long.`
          : `We're finalizing your withdrawal of ${displayAmount} ${symbol}. This won't take long.`}
      />

      <TxSuccessModal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          onClose();
        }}
        title={mode === "deposit" ? "Deposit successful" : "Withdrawal successful"}
        message={successMessage}
      />
    </>
  );
}


