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

export default function RepayLoanDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const search = useSearchParams();
  const router = useRouter();
  const amount = "₦100,000.00";
  const date = "18 Sep at 12:20PM";
  const status = (search.get("status") ?? "pending") as "pending" | "paid";
  const [open, setOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const confirmTimerRef = React.useRef<number | null>(null);
  const confirmIntervalRef = React.useRef<number | null>(null);
  const [confirmingProgress, setConfirmingProgress] = React.useState(0);

  function startConfirming() {
    setConfirming(true);
    if (confirmTimerRef.current) {
      window.clearTimeout(confirmTimerRef.current);
    }
    if (confirmIntervalRef.current) {
      window.clearInterval(confirmIntervalRef.current);
    }
    setConfirmingProgress(0);
    const totalMs = 2200; // simulate ~2.2s to success
    const stepMs = 60;
    const stepInc = (100 * stepMs) / totalMs; // ~2.72%
    confirmIntervalRef.current = window.setInterval(() => {
      setConfirmingProgress((p) => {
        const next = p + stepInc;
        if (next >= 100) {
          if (confirmIntervalRef.current) window.clearInterval(confirmIntervalRef.current);
          confirmIntervalRef.current = null;
          // small delay so the bar visually lands on 100%
          confirmTimerRef.current = window.setTimeout(() => {
            setConfirming(false);
            setSuccess(true);
            confirmTimerRef.current = null;
          }, 180);
          return 100;
        }
        return next;
      });
    }, stepMs) as unknown as number;
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
          <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-[12px] ${status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>
            {status === "pending" ? "Pending repayment" : "Repayment received"}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <CollateralRow
            assets={[
              { symbol: "USDT", amount: "20", logo: "/assets/usdt.svg" },
              { symbol: "USDC", amount: "30", logo: "/assets/usdc.svg" },
              { symbol: "BNB", amount: "1.23", logo: "/assets/bnb.svg" },
            ]}
          />
          <Row left="Receiver details" right={"Hodl Pool\nBase Chain  |  0x1234...abcd"} />
          <Row left="Remark" right="Repayment scheduled" />
          <Row left="Transaction No." right={id} />
          <Row left="Transaction date" right={date} />
          <Row left="Transaction type" right="Money borrowed" />
        </div>
      </div>

      <div className="fixed inset-x-0 z-10 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
        <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          {status === "pending" ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(true)} className="w-full rounded-[20px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white text-center cursor-pointer">Repay now</button>
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
          <RepayModal
            open={open}
            onClose={() => setOpen(false)}
            amount={amount}
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
          <RepayConfirmingModal
            open={confirming}
            onClose={() => setConfirming(false)}
            amount={amount}
            progress={confirmingProgress}
          />
          <RepayFailedModal
            open={failed}
            onClose={() => setFailed(false)}
            title="Payment cancelled"
            message="You closed the repayment flow. You can try again whenever you’re ready."
            onRetry={() => {
              setFailed(false);
              setOpen(true);
            }}
          />
          <RepaySuccessModal
            open={success}
            onClose={() => setSuccess(false)}
            amount={amount}
            onViewReceipt={() => {
              setSuccess(false);
              router.push(`/home/transactions/${id}?type=repaid&status=success`);
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
