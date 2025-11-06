"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";
import { VisibilityProvider } from "@/components/visibility";
import BalanceRow from "@/components/BalanceRow";
import Modal from "@/components/ui/Modal";
import CustomInput from "@/components/inputs/CustomInput";
import TxConfirmModal from "@/components/wallet/TxConfirmModal";
import ProcessingModal from "@/components/wallet/ProcessingModal";
import TxSuccessModal from "@/components/wallet/TxSuccessModal";
import TxFailedModal from "@/components/wallet/TxFailedModal";
import Image from "next/image";

export default function EarnPage() {
  const [tab, setTab] = React.useState<"lp" | "mm">("lp");

  return (
    <div className="min-h-dvh">
      <VisibilityProvider>
        <main className="px-3 text-left">
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <BorrowTopNav title="Earn" subtitle="Supply cNGN to earn yield in two ways" />
          </div>

          <section className="mt-4">
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button type="button" className={`rounded-full px-4 py-1.5 text-[14px] font-medium ${tab === "lp" ? "bg-white shadow" : "text-gray-700"}`} onClick={() => setTab("lp")}>Liquidity Pool</button>
              <button type="button" className={`rounded-full px-4 py-1.5 text-[14px] font-medium ${tab === "mm" ? "bg-white shadow" : "text-gray-700"}`} onClick={() => setTab("mm")}>Money Market</button>
            </div>
          </section>

          {tab === "lp" ? <LiquidityPoolCard /> : <MoneyMarketCard />}
        </main>
      </VisibilityProvider>
    </div>
  );
}

function LiquidityPoolCard() {
  // Pool state (simulated)
  const [poolTotal, setPoolTotal] = React.useState<number>(5_000_000); // cNGN
  const [borrowed, setBorrowed] = React.useState<number>(1_750_000); // cNGN
  const [userSupply, setUserSupply] = React.useState<number>(120_000); // cNGN
  const [lpDepositedAt, setLpDepositedAt] = React.useState<number | null>(Date.now() - 12 * 24 * 3600 * 1000); // seeded for demo

  const utilization = React.useMemo(() => (poolTotal === 0 ? 0 : (borrowed / poolTotal) * 100), [poolTotal, borrowed]);
  // simple variable-rate curve: 4% base + 26% * utilization
  const apr = React.useMemo(() => {
    const u = Math.min(100, Math.max(0, utilization)) / 100;
    return 4 + 26 * u; // percent p.a.
  }, [utilization]);
  const lpEarned = React.useMemo(() => {
    if (!lpDepositedAt || userSupply <= 0) return 0;
    const days = Math.max(0, Math.floor((Date.now() - lpDepositedAt) / (24 * 3600 * 1000)));
    const dailyRate = apr / 100 / 365;
    return userSupply * dailyRate * days;
  }, [lpDepositedAt, userSupply, apr]);

  const [editOpen, setEditOpen] = React.useState<false | "supply" | "withdraw" | "">(false);
  const [amount, setAmount] = React.useState<string>("");
  const amtNum = parseFloat(amount || "0");
  const isSupply = editOpen === "supply";
  const isWithdraw = editOpen === "withdraw";
  const invalid = React.useMemo(() => {
    if (amount === "") return false;
    if (amtNum <= 0) return true;
    if (isWithdraw && amtNum > userSupply) return true;
    return false;
  }, [amount, amtNum, isWithdraw, userSupply]);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [processingOpen, setProcessingOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [failedOpen, setFailedOpen] = React.useState(false);

  function openFlow(kind: "supply" | "withdraw") {
    setAmount("");
    setEditOpen(kind);
  }

  function handleConfirm() {
    setConfirmOpen(false);
    setProcessingOpen(true);
    window.setTimeout(() => {
      setProcessingOpen(false);
      const ok = Math.random() > 0.12; // simulate
      if (ok) {
        if (isSupply) {
          setUserSupply(prev => prev + amtNum);
          setPoolTotal(prev => prev + amtNum);
          setLpDepositedAt((t) => t ?? Date.now());
        } else if (isWithdraw) {
          setUserSupply(prev => Math.max(0, prev - amtNum));
          setPoolTotal(prev => Math.max(0, prev - amtNum));
          if (userSupply - amtNum <= 0) setLpDepositedAt(null);
        }
        setSuccessOpen(true);
        setEditOpen(false);
      } else {
        setFailedOpen(true);
      }
    }, 1200);
  }

  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[18px] font-semibold">cNGN Liquidity Pool</div>
            <div className="mt-1 text-[13px] text-gray-600">Supply cNGN to earn interest when borrowers draw liquidity.</div>
          </div>
          <Image src="/assets/cngn.svg" alt="cNGN" width={36} height={36} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <BalanceRow label="Pool TVL" amount={`${formatNumber(poolTotal)} cNGN`} showToggle={false} />
          <BalanceRow label="Total borrowed" amount={`${formatNumber(borrowed)} cNGN`} showToggle={false} />
          <BalanceRow label="Utilization" amount={`${utilization.toFixed(2)}%`} showToggle={false} />
          <BalanceRow label="Current APR" amount={`${apr.toFixed(2)}%`} showToggle={false} />
        </div>
        <div className="mt-4 rounded-xl border border-gray-100 p-3">
          <div className="flex items-center justify-between">
            <div className="text-[14px] text-gray-600">Your supplied</div>
            <div className="text-[16px] font-semibold">{formatNumber(userSupply)} cNGN</div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[12px] text-gray-600">Estimated earned</div>
            <div className="text-[14px] font-semibold">{formatNumber(lpEarned)} cNGN</div>
          </div>
          {lpDepositedAt && (
            <div className="mt-1 text-[12px] text-gray-500">since {formatDate(new Date(lpDepositedAt))}</div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" className="w-1/2 rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer" onClick={() => openFlow("supply")}>Supply</button>
          <button type="button" className="w-1/2 rounded-[14px] bg-gray-100 px-4 py-3 text-[14px] font-medium cursor-pointer" onClick={() => openFlow("withdraw")}>Withdraw</button>
        </div>
      </div>

      <Modal open={!!editOpen} onClose={() => setEditOpen(false)}>
        <div className="space-y-4">
          <div className="text-[18px] font-semibold">{isSupply ? "Supply cNGN" : "Withdraw cNGN"}</div>
          <CustomInput value={amount} onChange={setAmount} tokenLabel="cNGN" tokenIconSrc="/assets/cngn.svg" invalid={invalid} />
          {isWithdraw && (
            <div className="mt-1 text-[12px] text-gray-600">Available: {formatNumber(userSupply)} cNGN</div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="rounded-[14px] bg-gray-200 px-4 py-2 text-[14px]" onClick={() => setEditOpen(false)}>Cancel</button>
            <button type="button" disabled={invalid || !amount} className={`rounded-[14px] px-4 py-2 text-[14px] font-medium ${(!invalid && amount) ? "bg-[#2200FF] text-white" : "bg-gray-200 text-gray-500"}`} onClick={() => setConfirmOpen(true)}>{isSupply ? "Supply" : "Withdraw"}</button>
          </div>
        </div>
      </Modal>

      <TxConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={isSupply ? "Confirm supply" : "Confirm withdraw"}
        iconSrc="/assets/cngn.svg"
        rows={[{ label: isSupply ? "Supply amount" : "Withdraw amount", value: `${formatNumber(amtNum || 0)} cNGN` }, { label: "Current APR", value: `${apr.toFixed(2)}%` }]}
        confirmLabel={isSupply ? "Supply" : "Withdraw"}
        onConfirm={handleConfirm}
      />
      <ProcessingModal open={processingOpen} onClose={() => setProcessingOpen(false)} title={isSupply ? "Supplying…" : "Withdrawing…"} />
      <TxSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} message={<span>Done. {isSupply ? "Supply" : "Withdraw"} confirmed.</span>} />
      <TxFailedModal open={failedOpen} onClose={() => setFailedOpen(false)} onRetry={() => { setFailedOpen(false); setConfirmOpen(true); }} />
    </section>
  );
}

function MoneyMarketCard() {
  const FIXED_APR = 20.25; // % p.a.
  const MONTHLY_RATE = 1.6875; // % per 31+ days

  type Position = { principal: number; depositedAt: number; autoReinvest: boolean };
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [amount, setAmount] = React.useState<string>("");
  const amtNum = parseFloat(amount || "0");
  const now = Date.now();

  // Overview totals
  const totalPrincipal = React.useMemo(() => positions.reduce((t, p) => t + p.principal, 0), [positions]);
  const totalAccrued = React.useMemo(() => positions.reduce((t, p) => t + computeAccrued(p.principal, p.depositedAt, FIXED_APR), 0), [positions]);

  // Modals state
  const [depositOpen, setDepositOpen] = React.useState(false);
  const [withdrawIdx, setWithdrawIdx] = React.useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [processingOpen, setProcessingOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [failedOpen, setFailedOpen] = React.useState(false);

  // Validation
  const isDeposit = withdrawIdx === null;
  const isWithdraw = withdrawIdx !== null;
  const invalid = React.useMemo(() => {
    if (amount === "") return false;
    if (amtNum <= 0) return true;
    if (isWithdraw) {
      const p = withdrawIdx !== null ? positions[withdrawIdx] : undefined;
      if (!p) return true;
      if (amtNum > p.principal) return true;
      const locked = isLocked(p.depositedAt, now);
      if (locked) return true;
    }
    return false;
  }, [amount, amtNum, isWithdraw, withdrawIdx, positions, now]);

  function openDeposit() {
    setAmount("");
    setWithdrawIdx(null);
    setDepositOpen(true);
  }
  function openWithdraw(idx: number) {
    setAmount("");
    setWithdrawIdx(idx);
    setDepositOpen(true);
  }

  function handleConfirm() {
    setConfirmOpen(false);
    setProcessingOpen(true);
    window.setTimeout(() => {
      setProcessingOpen(false);
      const ok = Math.random() > 0.12;
      if (ok) {
        if (isDeposit) {
          setPositions(prev => [...prev, { principal: amtNum, depositedAt: Date.now(), autoReinvest: false }]);
        } else if (isWithdraw && withdrawIdx !== null) {
          setPositions(prev => {
            const copy = prev.slice();
            const p = copy[withdrawIdx];
            if (!p) return prev;
            const remaining = Math.max(0, p.principal - amtNum);
            if (remaining === 0) {
              copy.splice(withdrawIdx, 1);
            } else {
              copy[withdrawIdx] = { ...p, principal: remaining };
            }
            return copy;
          });
        }
        setSuccessOpen(true);
        setDepositOpen(false);
      } else {
        setFailedOpen(true);
      }
    }, 1200);
  }

  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[18px] font-semibold">Local Money Market</div>
            <div className="mt-1 text-[13px] text-gray-600">Deposit cNGN and earn fixed yield with a minimum 31-day lock.</div>
          </div>
          <Image src="/assets/cngn.svg" alt="cNGN" width={36} height={36} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <BalanceRow label="Fixed APR" amount={`${FIXED_APR.toFixed(2)}% p.a.`} showToggle={false} />
          <BalanceRow label="Monthly rate" amount={`${MONTHLY_RATE.toFixed(4)}%`} showToggle={false} />
          <BalanceRow label="Total principal" amount={`${formatNumber(totalPrincipal)} cNGN`} showToggle={false} />
          <BalanceRow label="Total accrued" amount={`${formatNumber(totalAccrued)} cNGN`} showToggle={false} />
        </div>

        {/* Positions list */}
        <div className="mt-4 space-y-3">
          {positions.length === 0 ? (
            <div className="rounded-xl border border-gray-100 p-3 text-[13px] text-gray-600">No active positions. Deposit to start a new position (31-day minimum lock).</div>
          ) : (
            positions.map((p, idx) => {
              const locked = isLocked(p.depositedAt, now);
              const daysToUnlock = getDaysToUnlock(p.depositedAt, now);
              const progressPct = getProgressPct(p.depositedAt, now);
              const unlockAt = p.depositedAt + 31 * 24 * 3600 * 1000;
              const unlockYield = p.principal * (MONTHLY_RATE / 100);
              const unlockTotal = p.principal + unlockYield;
              const accrued = computeAccrued(p.principal, p.depositedAt, FIXED_APR);
              return (
                <div key={`pos-${idx}`} className="rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] text-gray-600">Position • {formatDate(new Date(p.depositedAt))}</div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${locked ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>{locked ? `${daysToUnlock} days` : "Ready"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[13px]">
                    <div className="text-gray-600">Principal</div>
                    <div className="font-semibold">{formatNumber(p.principal)} cNGN</div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[13px]">
                    <div className="text-gray-600">Accrued</div>
                    <div className="font-semibold">{formatNumber(accrued)} cNGN</div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                      <span>Lock progress</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#2200FF]" style={{ width: `${progressPct}%` }} /></div>
                    <div className="mt-1 text-[11px] text-gray-500">{Math.min(31, Math.max(0, Math.floor((now - p.depositedAt) / (24 * 3600 * 1000))))} / 31 days</div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
                    <div className="rounded-lg border border-gray-100 p-2">
                      <div className="text-gray-600">Unlock date</div>
                      <div className="mt-1 text-[13px] font-semibold">{formatDate(new Date(unlockAt))}</div>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-2">
                      <div className="text-gray-600">Unlock amount (yield)</div>
                      <div className="mt-1 text-[13px] font-semibold">{formatNumber(unlockYield)} cNGN</div>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-2">
                      <div className="text-gray-600">Total at unlock</div>
                      <div className="mt-1 text-[13px] font-semibold">{formatNumber(unlockTotal)} cNGN</div>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-600">Auto reinvest</div>
                          <div className="mt-1 text-[11px] text-gray-500">{p.autoReinvest ? "Enabled" : "Disabled"}</div>
                        </div>
                        <button type="button" onClick={() => setPositions(prev => { const copy = prev.slice(); copy[idx] = { ...copy[idx], autoReinvest: !copy[idx].autoReinvest }; return copy; })} className={`inline-flex h-6 w-11 items-center rounded-full ${p.autoReinvest ? "bg-[#2200FF]" : "bg-gray-300"}`}>
                          <span className={`ml-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${p.autoReinvest ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" className={`w-1/2 rounded-[14px] bg-gray-100 px-4 py-3 text-[14px] font-medium ${locked || p.principal <= 0 ? "text-gray-500" : ""}`} disabled={locked || p.principal <= 0} onClick={() => openWithdraw(idx)}>Withdraw</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button type="button" className="w-full rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer" onClick={openDeposit}>Deposit</button>
        </div>
      </div>

      {/* Shared modal for deposit or withdraw (determined by withdrawIdx) */}
      <Modal open={depositOpen} onClose={() => setDepositOpen(false)}>
        <div className="space-y-4">
          <div className="text-[18px] font-semibold">{isDeposit ? "Deposit cNGN" : "Withdraw cNGN"}</div>
          <CustomInput value={amount} onChange={setAmount} tokenLabel="cNGN" tokenIconSrc="/assets/cngn.svg" invalid={invalid} />
          {isDeposit ? (
            <div className="mt-1 text-[12px] text-gray-600">Minimum lock: 31 days to earn 1.6875% monthly.</div>
          ) : (
            <div className="mt-1 text-[12px] text-gray-600">Available: {withdrawIdx !== null ? formatNumber(positions[withdrawIdx]?.principal ?? 0) : 0} cNGN</div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="rounded-[14px] bg-gray-200 px-4 py-2 text-[14px]" onClick={() => setDepositOpen(false)}>Cancel</button>
            <button type="button" disabled={invalid || !amount} className={`rounded-[14px] px-4 py-2 text-[14px] font-medium ${(!invalid && amount) ? "bg-[#2200FF] text-white" : "bg-gray-200 text-gray-500"}`} onClick={() => setConfirmOpen(true)}>{isDeposit ? "Deposit" : "Withdraw"}</button>
          </div>
        </div>
      </Modal>

      <TxConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={isDeposit ? "Confirm deposit" : "Confirm withdraw"}
        iconSrc="/assets/cngn.svg"
        rows={[{ label: isDeposit ? "Deposit amount" : "Withdraw amount", value: `${formatNumber(amtNum || 0)} cNGN` }, { label: "Fixed APR", value: `${FIXED_APR.toFixed(2)}% p.a.` }]}
        confirmLabel={isDeposit ? "Deposit" : "Withdraw"}
        onConfirm={handleConfirm}
      />
      <ProcessingModal open={processingOpen} onClose={() => setProcessingOpen(false)} title={isDeposit ? "Depositing…" : "Withdrawing…"} />
      <TxSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} message={<span>Done. {isDeposit ? "Deposit" : "Withdraw"} confirmed.</span>} />
      <TxFailedModal open={failedOpen} onClose={() => setFailedOpen(false)} onRetry={() => { setFailedOpen(false); setConfirmOpen(true); }} />
    </section>
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Helpers for Money Market
function isLocked(depositedAt: number, now: number) {
  return now - depositedAt < 31 * 24 * 3600 * 1000;
}
function getDaysToUnlock(depositedAt: number, now: number) {
  const ms = 31 * 24 * 3600 * 1000 - (now - depositedAt);
  return Math.max(0, Math.ceil(ms / (24 * 3600 * 1000)));
}
function getProgressPct(depositedAt: number, now: number) {
  const pct = Math.floor(((now - depositedAt) / (31 * 24 * 3600 * 1000)) * 100);
  return Math.max(0, Math.min(100, pct));
}
function computeAccrued(principal: number, depositedAt: number, fixedApr: number) {
  const now = Date.now();
  const daysHeld = Math.floor((now - depositedAt) / (24 * 3600 * 1000));
  const d = Math.max(0, daysHeld - 31);
  const dailyRate = fixedApr / 100 / 365;
  return principal * dailyRate * d;
}
