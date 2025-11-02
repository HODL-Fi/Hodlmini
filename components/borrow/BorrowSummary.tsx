"use client";
import Image from "next/image";
import React from "react";

type BorrowSummaryProps = {
  onClose: () => void;
  onConfirm: () => void;
  // New: list of collaterals; if not provided, falls back to single fields below
  collaterals?: Array<{ symbol: string; amount: number; icon?: string }>;
  // Back-compat single-collateral props
  collateralAmount?: number;
  collateralSymbol?: string;
  collateralIcon?: string;
  receiveAmount: number;
  fiatCode: string;
  ltvPercent: number; // e.g., 70
  tenureDays: number; // e.g., 30
  baseDailyRate?: number; // default 0.0005 (0.05%)
  overdueDailyRate?: number; // default 0.00025 (0.025%)
};

export default function BorrowSummary(props: BorrowSummaryProps) {
  const {
    onClose,
    onConfirm,
    collaterals,
    collateralAmount,
    collateralSymbol,
    collateralIcon,
    receiveAmount,
    fiatCode,
    ltvPercent,
    tenureDays,
    baseDailyRate = 0.0005,
    overdueDailyRate = 0.00025,
  } = props;

  const interest = receiveAmount * baseDailyRate * tenureDays;
  const totalRepay = receiveAmount + interest;
  const overduePerDay = receiveAmount * overdueDailyRate;

  function formatNumber(n: number, fractionDigits = 2) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(n);
  }

  function formatFiat(code: string, amount: number) {
    const symbols: Record<string, string> = { NGN: "₦", ZAR: "R", GHC: "₵", KHS: "KSh" };
    const prefix = symbols[code] ?? "";
    return `${prefix}${formatNumber(amount)}`;
  }

  const collateralRows: Array<{ key: string; icon?: string; label: string; value: string }> = [];
  if (collaterals && collaterals.length > 0) {
    collaterals.forEach((c, idx) => {
      collateralRows.push({
        key: `${c.symbol}-${idx}`,
        icon: c.icon,
        label: "Collateral",
        value: `${formatNumber(c.amount)} ${c.symbol}`,
      });
    });
  } else if (typeof collateralAmount === "number" && collateralSymbol) {
    collateralRows.push({
      key: `${collateralSymbol}-0`,
      icon: collateralIcon,
      label: "Collateral",
      value: `${formatNumber(collateralAmount)} ${collateralSymbol}`,
    });
  }

  return (
    <div className="text-left">
      <div className="flex items-start justify-between">
        <div className="text-[20px] font-semibold leading-6">Confirm borrow</div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="mt-4 rounded-[16px] border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-y-3 text-[14px]">
          {collateralRows.map((row) => (
            <React.Fragment key={row.key}>
              <div className="text-gray-600">{row.label}</div>
              <div className="text-right font-medium flex items-center justify-end gap-2">
                {row.icon && <Image src={row.icon} alt={row.key} width={18} height={18} />}
                <span>{row.value}</span>
              </div>
            </React.Fragment>
          ))}

          <div className="text-gray-600">To receive</div>
          <div className="text-right font-medium">{formatFiat(fiatCode, receiveAmount)}</div>

          <div className="text-gray-600">LTV</div>
          <div className="text-right font-medium">{ltvPercent}%</div>

          <div className="text-gray-600">Tenure</div>
          <div className="text-right font-medium">{tenureDays} days</div>

          <div className="text-gray-600">Rate for tenure</div>
          <div className="text-right font-medium">{formatNumber(baseDailyRate * tenureDays * 100, 2)}%</div>

          <div className="text-gray-600">Interest</div>
          <div className="text-right font-medium">{formatFiat(fiatCode, interest)}</div>

          <div className="text-gray-600">Total to repay</div>
          <div className="text-right font-semibold">{formatFiat(fiatCode, totalRepay)}</div>
        </div>

        <div className="mt-3 rounded-[12px] bg-[#FFF7D6] p-3 text-[13px] text-gray-700">
          After {tenureDays} days, an extra {formatNumber(overdueDailyRate * 100, 3)}% per day applies (~{formatFiat(fiatCode, overduePerDay)} per extra day).
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-[14px] border border-gray-200 bg-white px-4 py-3 text-[14px] font-medium text-gray-800 cursor-pointer hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer"
        >
          Confirm Borrow
        </button>
      </div>
    </div>
  );
}


