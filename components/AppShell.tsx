"use client";
import React, { useEffect, useMemo } from "react";
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

// Create QueryClient singleton outside component for SSR safety
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // SSR: always return a new client
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }
  // Browser: use singleton pattern
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }
  return browserQueryClient;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Use useMemo to ensure stable reference across renders
  const queryClient = useMemo(() => {
    try {
      return getQueryClient();
    } catch (error) {
      console.error('Failed to create QueryClient:', error);
      // Fallback: create a new client if singleton fails
      return new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      });
    }
  }, []);
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


