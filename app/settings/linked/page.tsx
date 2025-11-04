"use client";

import React from "react";
import Image from "next/image";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

type Linked = { id: string; name: string; number: string; bank: string; logo: string };

export default function LinkedAccountsPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<Linked[]>([
    { id: "uba-1", name: "Zeebriya Jasper", number: "0123498765", bank: "United Bank for Africa", logo: "/banks/uba.svg" },
    { id: "fbn-2", name: "Zeebriya Jasper Hernandes", number: "0123498765", bank: "First Bank", logo: "/banks/fbn.svg" },
    { id: "rvn-3", name: "Zeebriya Jasper", number: "3498760125", bank: "Raven Bank", logo: "/banks/bank.svg" },
  ]);
  const [toDelete, setToDelete] = React.useState<Linked | null>(null);

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Linked accounts" showBack />
        </div>

        <section className="mx-auto mt-4 max-w-[560px] space-y-6">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Image src={it.logo} alt={it.bank} width={36} height={36} />
                </span>
                <div>
                  <div className="text-[20px] font-semibold leading-6">{it.name}</div>
                  <div className="mt-1 text-[14px] text-gray-600">{it.number} <span className="mx-2">|</span> {it.bank}</div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Delete linked account"
                onClick={() => setToDelete(it)}
                className="rounded-full p-2 text-red-500 hover:bg-red-50 cursor-pointer"
              >
                <Image src="/settings/trash.svg" alt="Delete" width={20} height={20} />
              </button>
            </div>
          ))}
        </section>

        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button
              type="button"
              className="w-full rounded-[20px] bg-[#2200FF] px-4 py-4 text-[16px] font-semibold text-white"
              onClick={() => router.push("/settings/linked/add")}
            >
              Add a linked account
            </button>
          </div>
        </div>
      </main>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)}>
        {toDelete && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-[24px] font-semibold leading-6">Delete linked account</div>
              <button type="button" aria-label="Close" onClick={() => setToDelete(null)} className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <p className="text-[16px] leading-7 text-gray-700">You are about to delete a linked account from your list of linked account. Are you sure you want to delete it?</p>
            <div className="rounded-2xl border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Image src={toDelete.logo} alt={toDelete.bank} width={24} height={24} />
                </span>
                <div>
                  <div className="text-[16px] font-semibold">{toDelete.name}</div>
                  <div className="text-[12px] text-gray-600">{toDelete.number} <span className="mx-1">|</span> {toDelete.bank}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="w-1/2 rounded-[18px] bg-gray-200 px-4 py-3 text-[14px] font-semibold text-gray-800" onClick={() => {
                setItems(prev => prev.filter(x => x.id !== toDelete.id));
                setToDelete(null);
              }}>Yes, delete</button>
              <button type="button" className="w-1/2 rounded-[18px] bg-[#EF4444] px-4 py-3 text-[14px] font-semibold text-white" onClick={() => setToDelete(null)}>No, cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


