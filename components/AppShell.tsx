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

// Create QueryClient singleton at module level - ensures it's always available
// This prevents React Query from trying to access undefined refs during initialization
let queryClientSingleton: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // SSR: return a new instance (won't be used, but satisfies type)
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }
  
  // Client-side: create singleton once
  if (!queryClientSingleton) {
    queryClientSingleton = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }
  
  return queryClientSingleton;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Use useRef to ensure QueryClient is stable across renders
  const queryClientRef = useRef<QueryClient | null>(null);
  
  if (!queryClientRef.current) {
    queryClientRef.current = getQueryClient();
  }
  
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


