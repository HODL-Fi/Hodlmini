"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";

type TierStatus = "not_started" | "in_progress" | "submitted" | "verified";

export default function VerificationPage() {
  // Simulated tier states
  const [tier0] = React.useState<TierStatus>("verified"); // default after signup
  const [tier1, setTier1] = React.useState<TierStatus>("not_started");
  const [tier2, setTier2] = React.useState<TierStatus>("not_started");
  const [tier3, setTier3] = React.useState<TierStatus>("not_started");

  const [openTier1, setOpenTier1] = React.useState(false);
  const [openTier2, setOpenTier2] = React.useState(false);
  const [openTier3, setOpenTier3] = React.useState(false);

  function chip(s: TierStatus) {
    const map: Record<TierStatus, string> = {
      not_started: "bg-gray-100 text-gray-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      submitted: "bg-blue-100 text-blue-700",
      verified: "bg-emerald-100 text-emerald-700",
    };
    const label: Record<TierStatus, string> = {
      not_started: "Not started",
      in_progress: "In progress",
      submitted: "Submitted",
      verified: "Verified",
    };
    return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${map[s]}`}>{label[s]}</span>;
  }

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Verifications" showBack />
        </div>

        <section className="mx-auto mt-4 max-w-[560px] space-y-4">
          <TierCard title="Tier 0" desc="Basic account (default after signup)" status={tier0}>
            <div className="text-[12px] text-gray-600">You can explore the app but cannot transact until higher tiers are verified.</div>
          </TierCard>

          <TierCard title="Tier 1" desc="BVN, NIN, phone and email verification" status={tier1}>
            <div className="text-[12px] text-gray-600">Provide your BVN & NIN, confirm your phone and email.</div>
            <div className="mt-2">
              <button type="button" className="rounded-[14px] bg-[#2200FF] px-4 py-2 text-[14px] font-medium text-white" onClick={()=>{ setOpenTier1(true); setTier1("in_progress"); }}>Start</button>
            </div>
          </TierCard>

          <TierCard title="Tier 2" desc="Government ID and selfie / liveness" status={tier2}>
            <div className="text-[12px] text-gray-600">Upload a valid ID and complete a quick liveness selfie check.</div>
            <div className="mt-2">
              <button type="button" className="rounded-[14px] bg-[#2200FF] px-4 py-2 text-[14px] font-medium text-white" onClick={()=>{ setOpenTier2(true); setTier2("in_progress"); }}>Start</button>
            </div>
          </TierCard>

          <TierCard title="Tier 3" desc="Proof of address and source of funds/wealth" status={tier3}>
            <div className="text-[12px] text-gray-600">Upload a recent utility bill and provide source of funds. Optionally allow location check.</div>
            <div className="mt-2">
              <button type="button" className="rounded-[14px] bg-[#2200FF] px-4 py-2 text-[14px] font-medium text-white" onClick={()=>{ setOpenTier3(true); setTier3("in_progress"); }}>Start</button>
            </div>
          </TierCard>
        </section>
      </main>

      <Tier1Modal open={openTier1} onClose={()=>setOpenTier1(false)} onSubmit={()=>{ setTier1("submitted"); setOpenTier1(false); }} />
      <Tier2Modal open={openTier2} onClose={()=>setOpenTier2(false)} onSubmit={()=>{ setTier2("submitted"); setOpenTier2(false); }} />
      <Tier3Modal open={openTier3} onClose={()=>setOpenTier3(false)} onSubmit={()=>{ setTier3("submitted"); setOpenTier3(false); }} />
    </div>
  );
}

function TierCard({ title, desc, status, children }: { title: string; desc: string; status: TierStatus; children?: React.ReactNode }) {
  const mapBorder: Record<TierStatus, string> = {
    not_started: "border-gray-200",
    in_progress: "border-yellow-300",
    submitted: "border-blue-300",
    verified: "border-emerald-300",
  };
  return (
    <div className={`rounded-2xl border ${mapBorder[status]} bg-white p-4`}> 
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[18px] font-semibold">{title}</div>
          <div className="mt-1 text-[13px] text-gray-600">{desc}</div>
        </div>
        {/* status chip rendered by parent to keep style consistent */}
        {/* simple duplication here for clarity */}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

// TIER 1 MODAL
function Tier1Modal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: () => void }) {
  const [bvn, setBvn] = React.useState("");
  const [nin, setNin] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [phoneVerified, setPhoneVerified] = React.useState(false);
  const bvnOk = /^\d{11}$/.test(bvn);
  const ninOk = /^\d{11}$/.test(nin);
  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const emailOk = /.+@.+\..+/.test(email);
  const canSubmit = bvnOk && ninOk && emailOk && phoneOk && emailVerified && phoneVerified;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-[18px] font-semibold">Tier 1 verification</div>
        <Field label="BVN" value={bvn} onChange={setBvn} placeholder="11 digits" />
        <Field label="NIN" value={nin} onChange={setNin} placeholder="11 digits" />
        <Field label="Phone number" value={phone} onChange={setPhone} placeholder="0801 234 5678" />
        <Field label="Email" value={email} onChange={setEmail} placeholder="name@mail.xyz" />
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-[12px] bg-gray-100 px-3 py-2 text-[12px]" onClick={()=>setPhoneVerified(true)}>{phoneVerified?"Phone verified":"Verify phone"}</button>
          <button type="button" className="rounded-[12px] bg-gray-100 px-3 py-2 text-[12px]" onClick={()=>setEmailVerified(true)}>{emailVerified?"Email verified":"Verify email"}</button>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="rounded-[14px] bg-gray-200 px-4 py-2 text-[14px]" onClick={onClose}>Cancel</button>
          <button type="button" disabled={!canSubmit} className={`rounded-[14px] px-4 py-2 text-[14px] font-medium ${canSubmit?"bg-[#2200FF] text-white":"bg-gray-200 text-gray-500"}`} onClick={onSubmit}>Submit</button>
        </div>
      </div>
    </Modal>
  );
}

// TIER 2 MODAL
function Tier2Modal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: () => void }) {
  const [idType, setIdType] = React.useState("" as "drivers" | "passport" | "national" | "");
  const [idFile, setIdFile] = React.useState<File | null>(null);
  const [selfieOk, setSelfieOk] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const canSubmit = Boolean(idType && idFile && selfieOk);
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-[18px] font-semibold">Tier 2 verification</div>
        <div>
          <div className="text-[14px] text-gray-600">Government ID</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              {k:"drivers", n:"Driver's license"},
              {k:"passport", n:"International passport"},
              {k:"national", n:"National ID"},
            ].map((o)=> (
              <button key={o.k} type="button" className={`rounded-full px-3 py-1.5 text-[12px] ${idType===o.k?"bg-[#2200FF] text-white":"bg-gray-100 text-gray-700"}`} onClick={()=>setIdType(o.k as any)}>{o.n}</button>
            ))}
          </div>
          <input type="file" accept="image/*,.pdf" className="mt-2 text-[12px]" onChange={(e)=>setIdFile(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <div className="text-[14px] text-gray-600">Selfie / Liveness</div>
          <button type="button" className={`mt-2 rounded-[12px] px-3 py-2 text-[12px] ${selfieOk?"bg-emerald-100 text-emerald-700":"bg-gray-100"}`} onClick={()=>{
            setRunning(true);
            setTimeout(()=>{ setRunning(false); setSelfieOk(true); }, 1500);
          }}>{running?"Checking…":(selfieOk?"Liveness passed":"Start selfie check")}</button>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="rounded-[14px] bg-gray-200 px-4 py-2 text-[14px]" onClick={onClose}>Cancel</button>
          <button type="button" disabled={!canSubmit} className={`rounded-[14px] px-4 py-2 text-[14px] font-medium ${canSubmit?"bg-[#2200FF] text-white":"bg-gray-200 text-gray-500"}`} onClick={onSubmit}>Submit</button>
        </div>
      </div>
    </Modal>
  );
}

// TIER 3 MODAL
function Tier3Modal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: () => void }) {
  const [poaFile, setPoaFile] = React.useState<File | null>(null);
  const [sof, setSof] = React.useState("");
  const [geoOk, setGeoOk] = React.useState(false);
  const canSubmit = Boolean(poaFile && sof.trim().length >= 10);
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-[18px] font-semibold">Tier 3 verification</div>
        <div>
          <div className="text-[14px] text-gray-600">Proof of address (recent utility bill)</div>
          <input type="file" accept="image/*,.pdf" className="mt-2 text-[12px]" onChange={(e)=>setPoaFile(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <div className="text-[14px] text-gray-600">Source of funds / wealth</div>
          <textarea value={sof} onChange={(e)=>setSof(e.target.value)} placeholder="Explain your income sources succinctly" className="mt-2 w-full rounded-[14px] border border-gray-200 bg-white p-3 text-[14px] outline-none" rows={3} />
        </div>
        <div>
          <div className="text-[14px] text-gray-600">Location check (optional)</div>
          <button type="button" className={`mt-2 rounded-[12px] px-3 py-2 text-[12px] ${geoOk?"bg-emerald-100 text-emerald-700":"bg-gray-100"}`} onClick={()=>{
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(()=>setGeoOk(true), ()=>setGeoOk(false));
          }}>{geoOk?"Location verified":"Verify current location"}</button>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="rounded-[14px] bg-gray-200 px-4 py-2 text-[14px]" onClick={onClose}>Cancel</button>
          <button type="button" disabled={!canSubmit} className={`rounded-[14px] px-4 py-2 text-[14px] font-medium ${canSubmit?"bg-[#2200FF] text-white":"bg-gray-200 text-gray-500"}`} onClick={onSubmit}>Submit</button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string)=>void; placeholder?: string }) {
  return (
    <div>
      <div className="text-[14px] text-gray-600">{label}</div>
      <input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-[14px] border border-gray-200 bg-white px-3 py-3 text-[16px] outline-none" />
    </div>
  );
}


