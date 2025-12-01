"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import AuthTagCollage from "@/components/AuthTagCollage";
import CountrySelect from "@/components/CountrySelect";
import Modal from "@/components/ui/Modal";

type AuthMode = "signup" | "signin";
type CountryCode = string; // ISO 3166-1 alpha-2 code

function AuthPageInner() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams?.get("mode") === "signin" ? "signin" : "signup") as AuthMode;
  const [mode, setMode] = React.useState<AuthMode>(initialMode);
  const [country, setCountry] = React.useState<CountryCode>(""); // require explicit selection
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [signupEmail, setSignupEmail] = React.useState("");
  const [signinEmail, setSigninEmail] = React.useState("");
  const [requirementModalOpen, setRequirementModalOpen] = React.useState(false);
  const [modalVariant, setModalVariant] = React.useState<"requirements" | "email" | "info">("requirements");
  const [modalText, setModalText] = React.useState("");

  const hasCountry = Boolean(country);
  const hasAccepted = acceptedTerms;

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: (tokenResponse) => {
      console.log("google tokenResponse", tokenResponse);
    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  const isSignup = mode === "signup";
  const title = isSignup ? "Create your account" : "Welcome back";
  const isValidEmail = React.useMemo(() => /\S+@\S+\.\S+/.test(signupEmail), [signupEmail]);
  const isValidSigninEmail = React.useMemo(() => /\S+@\S+\.\S+/.test(signinEmail), [signinEmail]);

  return (
    <div className="h-dvh px-0 pt-[max(env(safe-area-inset-top),0px)] pb-[max(env(safe-area-inset-bottom),0px)] text-left flex flex-col overflow-hidden">
      {/* Top bar with country selector (Sign Up only) */}
      {isSignup ? (
        <div className="mx-auto w-full max-w-[560px] px-6 pt-4 shrink-0">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              {/* <Image src="/globe.svg" alt="" width={16} height={16} className="h-4 w-4" aria-hidden="true" /> */}
              {/* <span className="text-[12px] text-gray-600">Select country</span> */}
              <CountrySelect value={country} onChange={setCountry} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Main auth card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="mx-auto w-full max-w-[560px] px-6">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Mode toggle */}
            <div className="w-full max-w-[360px]">
              <div className="grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`px-4 py-2 rounded-xl text-[14px] font-medium transition-colors ${
                    isSignup ? "bg-white text-gray-900" : "text-gray-600"
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`px-4 py-2 rounded-xl text-[14px] font-medium transition-colors ${
                    !isSignup ? "bg-white text-gray-900" : "text-gray-600"
                  }`}
                >
                  Sign In
                </button>
              </div>
            </div>

          {/* Decorative collage */}
          <AuthTagCollage variant="crypto" height={240} />

            <h1 className="font-(family-name:--font-clash) text-[28px] font-semibold leading-[1.15] tracking-tight">
              {title}
            </h1>

            <div className="w-full max-w-[360px] space-y-3">
              {/* Google Sign-In */}
              <button
                type="button"
                onClick={() => {
                  if (isSignup && (!country || !acceptedTerms)) {
                    setRequirementModalOpen(true);
                    return;
                  }
                  googleLogin();
                }}
                className="block w-full rounded-[20px] bg-gray-100 px-4 py-3 text-[14px] font-medium text-gray-900 text-center flex items-center justify-center gap-2"
              >
                <Image src="/socials/google.svg" alt="Google" width={20} height={20} className="h-5 w-5" />
                <span>{isSignup ? "Sign up with Google" : "Sign in with Google"}</span>
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-2 my-1">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-[12px] text-gray-500">OR</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              {/* Email input (Sign Up only) */}
              {isSignup ? (
                <div className="space-y-2 text-left">
                  <label htmlFor="email" className="text-[12px] text-gray-600">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#2200FF]/20 focus:border-[#2200FF]"
                  />
                  {!signupEmail ? null : !isValidEmail ? (
                    <div className="text-[12px] text-red-600">Enter a valid email.</div>
                  ) : null}
                </div>
              ) : null}

              {/* Email input (Sign In only) */}
              {!isSignup ? (
                <div className="space-y-2 text-left">
                  <label htmlFor="signin-email" className="text-[12px] text-gray-600">
                    Email address
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#2200FF]/20 focus:border-[#2200FF]"
                  />
                  {!signinEmail ? null : !isValidSigninEmail ? (
                    <div className="text-[12px] text-red-600">Enter a valid email.</div>
                  ) : null}
                </div>
              ) : null}

              {/* Terms (Sign Up only) */}
              {isSignup ? (
                <label className="flex items-start gap-3 text-left text-[12px] text-gray-600">
                  <input
                    type="checkbox"
                    className="mt-[2px]"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <span>
                    I accept the{" "}
                     <Link href="/terms" className="text-[#2200FF] underline">
                      Terms and Conditions
                    </Link>
                    .
                  </span>
                </label>
              ) : null}

              {/* Email button */}
              <button
                onClick={() => {
                  if (isSignup) {
                    // Require explicit country and T&C selection
                    if (!country || !acceptedTerms) {
                      setModalVariant("requirements");
                      setRequirementModalOpen(true);
                      return;
                    }
                    if (!isValidEmail) {
                      setModalVariant("email");
                      setModalText("Please enter a valid email address.");
                      setRequirementModalOpen(true);
                      return;
                    }
                    setModalVariant("info");
                    setModalText(`Sign-up with email: ${signupEmail} (to be implemented).`);
                    setRequirementModalOpen(true);
                  } else {
                    if (!isValidSigninEmail) {
                      setModalVariant("email");
                      setModalText("Please enter a valid email address.");
                      setRequirementModalOpen(true);
                      return;
                    }
                    setModalVariant("info");
                    setModalText("Email sign-in flow to be implemented.");
                    setRequirementModalOpen(true);
                  }
                }}
                disabled={!isSignup ? !isValidSigninEmail : false}
                className={`block w-full rounded-[20px] px-4 py-3 text-[14px] font-medium text-center ${
                  isSignup
                    ? "bg-[#2200FF] text-white"
                    : "bg-[#2200FF] text-white"
                } ${!isSignup && !isValidSigninEmail ? "opacity-90 cursor-not-allowed" : ""}`}
              >
                {isSignup ? "Sign up with email" : "Sign in with email"}
              </button>

              {/* State toggle link */}
              <div className="text-[14px] text-gray-700">
                {isSignup ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-[#2200FF] underline"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-[#2200FF] underline"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for unmet signup requirements */}
      <Modal open={requirementModalOpen} onClose={() => setRequirementModalOpen(false)}>
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div className="text-[18px] font-semibold">
              {modalVariant === "requirements" ? "Action required" : modalVariant === "email" ? "Invalid email" : "Notice"}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setRequirementModalOpen(false)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-3">
              <Image src="/icons/sad.svg" alt="Validation required" width={72} height={72} />
            </div>
            {modalVariant === "requirements" ? (
              <>
                <p className="max-w-[420px] text-[14px] leading-6 text-gray-600">
                  Please complete the items below to continue.
                </p>
                <ul className="mt-2 w-full max-w-[420px] text-left space-y-2">
                  <li className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${hasCountry ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
                    <span aria-hidden="true">
                      {hasCountry ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[14px] text-gray-800">Country selected</span>
                  </li>
                  <li className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${hasAccepted ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
                    <span aria-hidden="true">
                      {hasAccepted ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[14px] text-gray-800">Terms and Conditions accepted</span>
                  </li>
                </ul>
              </>
            ) : (
              <p className="max-w-[420px] text-[14px] leading-6 text-gray-600">{modalText}</p>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              className="w-full rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer"
              onClick={() => setRequirementModalOpen(false)}
            >
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}


