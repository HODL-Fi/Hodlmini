"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@customIcons";

export default function PublicTermsPage() {
  const router = useRouter();
  return (
    <div className="h-dvh px-0 pt-[max(env(safe-area-inset-top),0px)] pb-[max(env(safe-area-inset-bottom),0px)] text-left flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[560px] px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 cursor-pointer"
            >
              <ArrowLeftIcon size={18} color="#374151" />
            </button>
            <h1 className="font-(family-name:--font-clash) text-[28px] font-semibold leading-[1.15] tracking-tight">
              Terms and Conditions
            </h1>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-[14px] text-gray-800">
          <p>
            These Terms and Conditions govern your use of our services when creating an account or signing in.
            They are specific to onboarding and may differ from the in-app Terms available in the Settings area.
          </p>
          <h2 className="mt-6 text-[18px] font-semibold">1. Eligibility</h2>
          <p>You must be eligible under applicable laws in your selected country to use our services.</p>
          <h2 className="mt-6 text-[18px] font-semibold">2. Account Creation</h2>
          <p>Information you provide during sign up must be accurate and complete.</p>
          <h2 className="mt-6 text-[18px] font-semibold">3. Privacy</h2>
          <p>We process your data in accordance with our privacy practices. Additional terms may apply in-app.</p>
          <h2 className="mt-6 text-[18px] font-semibold">4. Acceptable Use</h2>
          <p>Do not use the service for unlawful activities. We may suspend access for violations.</p>
          <h2 className="mt-6 text-[18px] font-semibold">5. Changes</h2>
          <p>We may update these onboarding terms from time to time. Continued use indicates acceptance.</p>
          <p className="mt-6">For the full in-app Terms, visit the Terms section in Settings once signed in.</p>
        </div>
      </div>
    </div>
  );
}


