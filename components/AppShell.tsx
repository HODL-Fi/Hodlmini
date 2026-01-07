"use client";
import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import sdk from "@farcaster/miniapp-sdk";
import { PrivyAuthProvider } from "@/contexts/PrivyProvider";
import { usePrivyTokenSync } from "@/hooks/auth/usePrivyTokenSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Wrapper component to sync Privy token (must be inside PrivyAuthProvider)
function PrivyTokenSyncWrapper({ children }: { children: React.ReactNode }) {
  usePrivyTokenSync();
  return <>{children}</>;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Use lazy initializer with useRef for React 19 compatibility
  const queryClientRef = useRef<QueryClient>(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    })
  );
  
  const queryClient = queryClientRef.current;
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
          <PrivyAuthProvider>
            <PrivyTokenSyncWrapper>
              <div className={`mx-auto w-full max-w-[560px] min-h-dvh pt-[max(env(safe-area-inset-top),0px)] ${pb}`}>
                {children}
                {hideBottomNav ? null : <BottomNav />}
              </div>
              {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
            </PrivyTokenSyncWrapper>
          </PrivyAuthProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </div>
  );
}


