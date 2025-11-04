"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Bank = { key: string; name: string; logo: string };

export default function AddLinkedAccountPage() {
  const router = useRouter();
  const BANKS: Bank[] = React.useMemo(() => ([
    { key: "access", name: "Access Bank", logo: "/banks/bank.svg" },
    { key: "eco", name: "Ecobank", logo: "/banks/bank.svg" },
    { key: "uba", name: "United Bank for Africa (UBA)", logo: "/banks/uba.svg" },
    { key: "zen", name: "Zenith Bank", logo: "/banks/bank.svg" },
    { key: "fbn", name: "First Bank", logo: "/banks/fbn.svg" },
    { key: "rvn", name: "Raven Bank", logo: "/banks/bank.svg" },
  ]), []);

  const [acctNumber, setAcctNumber] = React.useState("0123456789");
  const [bankOpen, setBankOpen] = React.useState(false);
  const [bankQuery, setBankQuery] = React.useState("");
  const [bank, setBank] = React.useState<Bank | null>(null);
  const accountName = "JASPER JED"; // mock resolved name
  const canAdd = acctNumber.replace(/\D/g, "").length >= 10 && bank !== null;

  const filtered = React.useMemo(() => BANKS.filter(b => b.name.toLowerCase().includes(bankQuery.toLowerCase())), [BANKS, bankQuery]);

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Add a linked account" showBack />
        </div>

        <section className="mx-auto mt-6 max-w-[560px] space-y-6">
          <div>
            <div className="text-[14px] text-gray-600">Account number</div>
            <input
              value={acctNumber}
              onChange={(e)=>setAcctNumber(e.target.value)}
              className="mt-2 w-full rounded-[14px] border border-gray-200 bg-white px-3 py-3 text-[16px] outline-none"
            />
          </div>
          <div>
            <div className="text-[14px] text-gray-600">Bank name</div>
            <button type="button" className="mt-2 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-white px-3 py-3 cursor-pointer" onClick={()=>setBankOpen(true)}>
              <div className="flex items-center gap-2">
                <Image src={bank?.logo ?? "/banks/bank.svg"} alt="bank" width={20} height={20} />
                <span className="text-[16px]">{bank?.name ?? "Select bank name"}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          <div>
            <div className="text-[14px] text-gray-600">Account name</div>
            <div className="mt-2 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-gray-50 px-3 py-3 text-[16px]">{accountName}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button type="button" disabled={!canAdd} className={`w-full rounded-[20px] px-4 py-4 text-[16px] font-semibold ${canAdd ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`} onClick={()=>router.push("/settings/linked")}>Add</button>
          </div>
        </div>
      </main>

      <Modal open={bankOpen} onClose={()=>setBankOpen(false)}>
        <div className="space-y-3">
          <div className="text-[18px] font-semibold">Select bank</div>
          <div className="rounded-xl border border-gray-200 bg-white p-2">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3"/></svg>
              <input value={bankQuery} onChange={(e)=>setBankQuery(e.target.value)} placeholder="Search bank" className="w-full bg-transparent text-[14px] outline-none" />
            </div>
            <div className="mt-2 max-h-[300px] overflow-y-auto">
              <button type="button" className="flex w-full items-center gap-3 bg-gray-50 px-3 py-3 text-left">
                <Image src="/banks/bank.svg" alt="Select bank" width={24} height={24} />
                <div className="flex-1 text-[14px]">Select bank</div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </button>
              {filtered.map((b)=> (
                <button key={b.key} type="button" onClick={()=>{ setBank(b); setBankOpen(false); }} className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50">
                  <Image src={b.logo} alt={b.name} width={24} height={24} />
                  <div className="text-[14px]">{b.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}


