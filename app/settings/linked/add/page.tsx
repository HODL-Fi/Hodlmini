"use client";

import React from "react";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useGetUserProfile from "@/hooks/user/useGetUserProfile";
import useGetSupportedInstitutions from "@/hooks/offramp/useGetSupportedInstitutions";
import { useAddLinkedAccount } from "@/hooks/settings/useAddLinkedAccount";
import { getBankLogo } from "@/utils/banks/bankLogos";

type Bank = { code: string; name: string; type: string };

export default function AddLinkedAccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile } = useGetUserProfile();
  
  // Determine currency based on user's country (NG = NGN)
  const currency = React.useMemo(() => {
    if (profile?.country?.toLowerCase() === "ng") {
      return "NGN";
    }
    // Default to NGN for now, can be extended for other countries
    return "NGN";
  }, [profile?.country]);

  const { data: institutionsData, isLoading: isLoadingBanks } = useGetSupportedInstitutions(currency);
  const banks = React.useMemo(() => institutionsData?.institutions || [], [institutionsData]);
  const { mutateAsync: addLinkedAccount, isPending: isAddingAccount } = useAddLinkedAccount();
  const addLinkedAccountRef = React.useRef(addLinkedAccount);
  
  // Keep ref in sync
  React.useEffect(() => {
    addLinkedAccountRef.current = addLinkedAccount;
  }, [addLinkedAccount]);

  const [acctNumber, setAcctNumber] = React.useState("");
  const [bankOpen, setBankOpen] = React.useState(false);
  const [bankQuery, setBankQuery] = React.useState("");
  const [bank, setBank] = React.useState<Bank | null>(null);
  const [accountName, setAccountName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [showRetryModal, setShowRetryModal] = React.useState(false);
  const lastVerifiedRef = React.useRef<string>("");
  const retryCountRef = React.useRef<Map<string, number>>(new Map());
  const MAX_RETRIES = 2;

  const accountNumberDigits = acctNumber.replace(/\D/g, "");
  const hasValidInputs = accountNumberDigits.length >= 10 && bank !== null;
  const canAdd = hasValidInputs && accountName !== null && !isAddingAccount;

  // Reset verification state when inputs change
  React.useEffect(() => {
    setAccountName(null);
    setError(null);
    setShowRetryModal(false);
    lastVerifiedRef.current = "";
    retryCountRef.current.clear();
  }, [accountNumberDigits, bank?.code]);

  // Auto-verify account when both account number and bank are provided
  React.useEffect(() => {
    if (!hasValidInputs || isVerifying || !bank) return;

    const verificationKey = `${accountNumberDigits}-${bank.code}`;
    
    // Skip if we've already verified this combination
    if (lastVerifiedRef.current === verificationKey) {
      return;
    }

    const verifyAccount = async () => {
      // Mark as verifying immediately to prevent duplicate calls
      lastVerifiedRef.current = verificationKey;
      setIsVerifying(true);
      setError(null);
      
      try {
        const response = await addLinkedAccountRef.current({
          accountNumber: accountNumberDigits,
          bankCode: bank.code,
          currency: currency,
          bankType: bank.type,
        });
        
        setAccountName(response.accountName);
        retryCountRef.current.delete(verificationKey); // Clear retry count on success
      } catch (err: any) {
        const errorResponse = err?.response?.data as { error?: string; message?: string; statusCode?: number };
        
        // Don't show retry modal for 400/403 errors (these are user errors, not retryable)
        if (errorResponse?.statusCode === 400) {
          setError(errorResponse.message || "The name on the bank account does not match the name on your profile.");
          // Keep marked to prevent retry
        } else if (errorResponse?.statusCode === 403) {
          setError(errorResponse.message || "You must have a name set in your profile before adding a bank account.");
          // Keep marked to prevent retry
        } else {
          // For other errors (network, server errors, etc.), track retries
          const currentRetries = retryCountRef.current.get(verificationKey) || 0;
          const newRetryCount = currentRetries + 1;
          retryCountRef.current.set(verificationKey, newRetryCount);
          
          if (newRetryCount >= MAX_RETRIES) {
            setShowRetryModal(true);
            setError("Failed to verify account after multiple attempts.");
            // Keep marked to prevent further retries
          } else {
            setError("Failed to verify account. Please try again.");
            // Clear ref to allow retry
            lastVerifiedRef.current = "";
          }
        }
      } finally {
        setIsVerifying(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(verifyAccount, 500);
    return () => clearTimeout(timeoutId);
  }, [accountNumberDigits, bank?.code, currency, hasValidInputs, isVerifying]);

  const filtered = React.useMemo(() => {
    if (!bankQuery.trim()) return banks;
    const query = bankQuery.toLowerCase();
    return banks.filter(b => b.name.toLowerCase().includes(query));
  }, [banks, bankQuery]);

  // Memoize logo lookup function
  const getBankLogoPath = React.useCallback((bank: Bank | null) => {
    if (!bank) return "/icons/bank.svg";
    return getBankLogo(bank.code, bank.name);
  }, []);

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
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-white px-3 py-3 cursor-pointer"
              onClick={() => setBankOpen(true)}
              disabled={isLoadingBanks}
            >
              <div className="flex items-center gap-2">
                <Image src={getBankLogoPath(bank)} alt="bank" width={20} height={20} />
                <span className="text-[16px]">
                  {isLoadingBanks ? "Loading..." : bank?.name ?? "Select bank name"}
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          {accountName && (
          <div>
            <div className="text-[14px] text-gray-600">Account name</div>
              <div className="mt-2 flex w-full items-center justify-between rounded-[14px] border border-gray-200 bg-gray-50 px-3 py-3 text-[16px]">
                {accountName}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          )}
          {isVerifying && (
            <div className="text-[14px] text-gray-600 text-center py-2">
              Verifying account...
            </div>
          )}
          {error && (
            <div className="rounded-[14px] border border-red-200 bg-red-50 px-3 py-3 text-[14px] text-red-700">
              {error}
          </div>
          )}
        </section>

        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button
              type="button"
              disabled={!canAdd}
              className={`w-full rounded-[20px] px-4 py-4 text-[16px] font-semibold ${canAdd ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              onClick={async () => {
                if (canAdd && accountName && bank) {
                  // Invalidate linked accounts query to refresh the list
                  await queryClient.invalidateQueries({ queryKey: ["linked_accounts"] });
                  router.push("/settings/linked");
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </main>

      <Modal open={bankOpen} onClose={() => {
        setBankOpen(false);
        setBankQuery("");
      }}>
        <div className="space-y-3">
          <div className="text-[18px] font-semibold">Select bank</div>
          <div className="rounded-xl border border-gray-200 bg-white p-2">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3"/></svg>
              <input value={bankQuery} onChange={(e)=>setBankQuery(e.target.value)} placeholder="Search bank" className="w-full bg-transparent text-[14px] outline-none" />
            </div>
            <div className="mt-2 max-h-[300px] overflow-y-auto">
              {isLoadingBanks ? (
                <div className="px-3 py-6 text-center text-[14px] text-gray-600">Loading banks...</div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-[14px] text-gray-600">No banks found</div>
              ) : (
                filtered.map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => {
                      setBank(b);
                      setBankOpen(false);
                      setBankQuery("");
                    }}
                    className="flex w-full items-center gap-3 bg-white px-3 py-3 text-left hover:bg-gray-50"
                  >
                    <Image src={getBankLogo(b.code, b.name)} alt={b.name} width={24} height={24} />
                  <div className="text-[14px]">{b.name}</div>
                </button>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Retry Modal */}
      <Modal open={showRetryModal} onClose={() => setShowRetryModal(false)}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="text-[24px] font-semibold leading-6">Unable to verify account</div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowRetryModal(false)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-[16px] leading-7 text-gray-700">
            <p>We couldn't verify this account after multiple attempts.</p>
            <p>Please try:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Using a different account number</li>
              <li>Trying again later</li>
            </ul>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              className="w-full rounded-[18px] bg-[#2200FF] px-4 py-3 text-[14px] font-semibold text-white cursor-pointer"
              onClick={() => {
                setShowRetryModal(false);
                const verificationKey = `${accountNumberDigits}-${bank?.code}`;
                retryCountRef.current.delete(verificationKey);
                lastVerifiedRef.current = "";
                setError(null);
              }}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


