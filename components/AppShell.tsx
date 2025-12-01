"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import sdk from "@farcaster/miniapp-sdk";
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "@/contexts/web3authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";


const queryClient = new QueryClient();

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inTx = pathname?.startsWith("/home/transactions");
  const inWalletSub = pathname?.startsWith("/wallet/") && pathname !== "/wallet";
  const inOnboarding = pathname?.startsWith("/onboarding");
  const inAuth = pathname?.startsWith("/auth");
  const inPublicTerms = pathname?.startsWith("/terms");
  const hideBottomNav = Boolean(inTx || inWalletSub || inOnboarding || inAuth || inPublicTerms);
  const pb = hideBottomNav
    ? "pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+0px)]"
    : "pb-[calc(max(env(safe-area-inset-bottom,0px),16px)+64px)]";

  useEffect(() => {
    sdk.actions.ready();
  }, []);





  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <Web3AuthProvider config={web3AuthContextConfig}>
            <div className={`mx-auto w-full max-w-[560px] min-h-dvh pt-[max(env(safe-area-inset-top),0px)] ${pb}`}>
              {children}
              {hideBottomNav ? null : <BottomNav />}
            </div>
          </Web3AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </div>
  );
}


