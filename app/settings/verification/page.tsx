"use client";

import React from "react";
import Image from "next/image";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";
import { useAuthStore } from "@/stores/useAuthStore";
import { submitTierOneKyc, submitTierTwoKyc, submitTierThreeKyc } from "@/utils/api/kyc";

type TierStatus = "not_started" | "in_progress" | "submitted" | "verified";
type Country = "nigeria" | "kenya" | "ghana";

const COUNTRIES: Array<{ key: Country; name: string; flag: string }> = [
  { key: "nigeria", name: "Nigeria", flag: "/flags/nigeria.webp" },
  { key: "kenya", name: "Kenya", flag: "/flags/kenya.webp" },
  { key: "ghana", name: "Ghana", flag: "/flags/ghana.webp" },
];

export default function VerificationPage() {
  const userId = useAuthStore((state) => state.userId);
  const [country, setCountry] = React.useState<Country>("nigeria");
  const [countryModalOpen, setCountryModalOpen] = React.useState(false);
  
  // Simulated tier states
  const [tier0] = React.useState<TierStatus>("verified"); // default after signup
  const [tier1, setTier1] = React.useState<TierStatus>("not_started");
  const [tier2, setTier2] = React.useState<TierStatus>("not_started");
  const [tier3, setTier3] = React.useState<TierStatus>("not_started");

  const [openTier1, setOpenTier1] = React.useState(false);
  const [openTier2, setOpenTier2] = React.useState(false);
  const [openTier3, setOpenTier3] = React.useState(false);

  const isNigeria = country === "nigeria";
  const selectedCountry = COUNTRIES.find(c => c.key === country) || COUNTRIES[0];

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
          {/* Country Selector */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-[14px] text-gray-600 mb-2">Select country</div>
            <button
              type="button"
              onClick={() => setCountryModalOpen(true)}
              className="flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-white px-3 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <Image src={selectedCountry.flag} alt={selectedCountry.name} width={24} height={18} className="rounded-sm" />
                <span className="text-[14px] font-medium">{selectedCountry.name}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          <TierCard title="Basic" desc="Basic account (default after signup)" status={tier0}>
            <div className="text-[12px] text-gray-600">You can explore the app but cannot transact until higher tiers are verified.</div>
          </TierCard>

          {/* Standard - Only for Nigeria */}
          {isNigeria && (
            <TierCard title="Standard" desc="NIN and BVN verification" status={tier1}>
              <div className="flex items-center justify-between">
                <div className="text-[12px] text-gray-600">Provide your NIN and BVN to proceed.</div>
                {chip(tier1)}
              </div>
              <div className="mt-2">
                <button type="button" className="rounded-[14px] bg-[#2200FF] px-4 py-2 text-[14px] font-medium text-white" onClick={()=>{ setOpenTier1(true); setTier1("in_progress"); }}>Start</button>
              </div>
            </TierCard>
          )}

          <TierCard title="Enhanced" desc="Government ID and selfie / liveness" status={tier2}>
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-gray-600">Upload a valid ID and complete a quick liveness selfie check.</div>
              {chip(tier2)}
            </div>
            <div className="mt-2">
              <button type="button" className="rounded-[14px] bg-[#2200FF] px-4 py-2 text-[14px] font-medium text-white" onClick={()=>{ setOpenTier2(true); setTier2("in_progress"); }}>Start</button>
            </div>
          </TierCard>

          <TierCard title="Premium" desc="Proof of address and source of funds/wealth" status={tier3}>
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-gray-600">Upload a recent utility bill and provide source of funds. Optionally allow location check.</div>
              {chip(tier3)}
            </div>
            <div className="mt-2">
              <button type="button" className="rounded-[14px] bg-[#2200FF] px-4 py-2 text-[14px] font-medium text-white" onClick={()=>{ setOpenTier3(true); setTier3("in_progress"); }}>Start</button>
            </div>
          </TierCard>
        </section>
      </main>

      {/* Country Selection Modal */}
      <Modal open={countryModalOpen} onClose={() => setCountryModalOpen(false)}>
        <div className="space-y-3">
          <div className="text-[18px] font-semibold">Select country</div>
          <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden">
            {COUNTRIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setCountry(c.key);
                  setCountryModalOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 ${
                  country === c.key ? "bg-blue-50" : "bg-white"
                }`}
              >
                <Image src={c.flag} alt={c.name} width={24} height={18} className="rounded-sm" />
                <div className="text-[14px] font-medium">{c.name}</div>
                {country === c.key && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-[#2200FF]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Tier1Modal 
        open={openTier1} 
        userId={userId || ""}
        onClose={()=>setOpenTier1(false)} 
        onSubmit={async () => {
          setTier1("submitted");
          setOpenTier1(false);
        }}
        onStatusChange={setTier1}
      />
      <Tier2Modal 
        open={openTier2} 
        userId={userId || ""}
        onClose={()=>setOpenTier2(false)} 
        onSubmit={async () => {
          setTier2("submitted");
          setOpenTier2(false);
        }}
        onStatusChange={setTier2}
      />
      <Tier3Modal 
        open={openTier3} 
        userId={userId || ""}
        onClose={()=>setOpenTier3(false)} 
        onSubmit={async () => {
          setTier3("submitted");
          setOpenTier3(false);
        }}
        onStatusChange={setTier3}
      />
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

// STANDARD MODAL - Only NIN and BVN for Nigeria
function Tier1Modal({ 
  open, 
  onClose, 
  onSubmit, 
  userId,
  onStatusChange 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: () => void;
  userId: string;
  onStatusChange: (status: TierStatus) => void;
}) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [bvn, setBvn] = React.useState("");
  const [nin, setNin] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const bvnOk = /^\d{11}$/.test(bvn);
  const ninOk = /^\d{11}$/.test(nin);
  const phoneOk = /^\+?\d{10,15}$/.test(phone);
  const dobOk = /^\d{4}-\d{2}-\d{2}$/.test(dob);
  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0 && bvnOk && ninOk && dobOk && phoneOk && !loading;

  const handleSubmit = async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitTierOneKyc({
        userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ninNumber: nin,
        bvn: bvn,
        dob: dob,
        phone: phone,
      });
      
      onStatusChange("submitted");
      onSubmit();
      
      // Reset form
      setFirstName("");
      setLastName("");
      setBvn("");
      setNin("");
      setDob("");
      setPhone("");
    } catch (err: any) {
      setError(err.message || "Failed to submit verification");
      onStatusChange("in_progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-[18px] font-semibold">Standard verification</div>
        {error && (
          <div className="rounded-[14px] bg-red-50 px-3 py-2 text-[14px] text-red-700">
            {error}
          </div>
        )}
        <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="Enter your first name" />
        <Field label="Last Name" value={lastName} onChange={setLastName} placeholder="Enter your last name" />
        <Field label="BVN" value={bvn} onChange={setBvn} placeholder="11 digits" type="tel" />
        <Field label="NIN" value={nin} onChange={setNin} placeholder="11 digits" type="tel" />
        <Field label="Date of Birth" value={dob} onChange={setDob} placeholder="YYYY-MM-DD" type="date" />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+2348012345678" type="tel" />
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="rounded-[14px] bg-gray-200 px-4 py-2 text-[14px]" onClick={onClose} disabled={loading}>Cancel</button>
          <button 
            type="button" 
            disabled={!canSubmit} 
            className={`rounded-[14px] px-4 py-2 text-[14px] font-medium ${canSubmit?"bg-[#2200FF] text-white":"bg-gray-200 text-gray-500"}`} 
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ENHANCED MODAL
function Tier2Modal({ 
  open, 
  onClose, 
  onSubmit, 
  userId,
  onStatusChange 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: () => void;
  userId: string;
  onStatusChange: (status: TierStatus) => void;
}) {
  const [idType, setIdType] = React.useState("" as "drivers" | "passport" | "national" | "");
  const [idFile, setIdFile] = React.useState<File | null>(null);
  const [selfieOk, setSelfieOk] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const canSubmit = Boolean(idType && idFile && selfieOk && !loading);

  const handleSubmit = async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    if (!idFile) {
      setError("Please upload an ID file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitTierTwoKyc({
        userId,
        idType: idType as "drivers" | "passport" | "national",
        idFile: idFile,
      });
      
      onStatusChange("submitted");
      onSubmit();
      
      // Reset form
      setIdType("" as any);
      setIdFile(null);
      setSelfieOk(false);
    } catch (err: any) {
      setError(err.message || "Failed to submit verification");
      onStatusChange("in_progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-[18px] font-semibold">Enhanced verification</div>
        {error && (
          <div className="rounded-[14px] bg-red-50 px-3 py-2 text-[14px] text-red-700">
            {error}
          </div>
        )}
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
          <button type="button" className="rounded-[14px] bg-gray-200 px-4 py-2 text-[14px]" onClick={onClose} disabled={loading}>Cancel</button>
          <button 
            type="button" 
            disabled={!canSubmit} 
            className={`rounded-[14px] px-4 py-2 text-[14px] font-medium ${canSubmit?"bg-[#2200FF] text-white":"bg-gray-200 text-gray-500"}`} 
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// PREMIUM MODAL
function Tier3Modal({ 
  open, 
  onClose, 
  onSubmit, 
  userId,
  onStatusChange 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: () => void;
  userId: string;
  onStatusChange: (status: TierStatus) => void;
}) {
  const [poaFile, setPoaFile] = React.useState<File | null>(null);
  const [sof, setSof] = React.useState("");
  const [geoOk, setGeoOk] = React.useState(false);
  const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const canSubmit = Boolean(poaFile && sof.trim().length >= 10 && !loading);

  const handleLocationCheck = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoOk(true);
      },
      () => {
        setError("Failed to get location");
        setGeoOk(false);
      }
    );
  };

  const handleSubmit = async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    if (!poaFile) {
      setError("Please upload a proof of address file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitTierThreeKyc({
        userId,
        poaFile: poaFile,
        sourceOfFunds: sof.trim(),
        locationCheck: location || undefined,
      });
      
      onStatusChange("submitted");
      onSubmit();
      
      // Reset form
      setPoaFile(null);
      setSof("");
      setGeoOk(false);
      setLocation(null);
    } catch (err: any) {
      setError(err.message || "Failed to submit verification");
      onStatusChange("in_progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-[18px] font-semibold">Premium verification</div>
        {error && (
          <div className="rounded-[14px] bg-red-50 px-3 py-2 text-[14px] text-red-700">
            {error}
          </div>
        )}
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
          <button type="button" className={`mt-2 rounded-[12px] px-3 py-2 text-[12px] ${geoOk?"bg-emerald-100 text-emerald-700":"bg-gray-100"}`} onClick={handleLocationCheck}>
            {geoOk?"Location verified":"Verify current location"}
          </button>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="rounded-[14px] bg-gray-200 px-4 py-2 text-[14px]" onClick={onClose} disabled={loading}>Cancel</button>
          <button 
            type="button" 
            disabled={!canSubmit} 
            className={`rounded-[14px] px-4 py-2 text-[14px] font-medium ${canSubmit?"bg-[#2200FF] text-white":"bg-gray-200 text-gray-500"}`} 
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string)=>void; placeholder?: string; type?: string }) {
  return (
    <div>
      <div className="text-[14px] text-gray-600">{label}</div>
      <input 
        type={type}
        value={value} 
        onChange={(e)=>onChange(e.target.value)} 
        placeholder={placeholder} 
        className="mt-2 w-full rounded-[14px] border border-gray-200 bg-white px-3 py-3 text-[16px] outline-none" 
      />
    </div>
  );
}


