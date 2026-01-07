"use client";
import React, { useEffect, useState } from "react";
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
  // Track if we're mounted on client to prevent hydration issues
  const [mounted, setMounted] = useState(false);
  
  // Create QueryClient using useState lazy initializer
  // Must be available for both SSR and client-side to prevent build errors
  const [queryClient] = useState(() => {
    try {
      // Always create QueryClient, even during SSR/build
      // This prevents "No QueryClient set" errors during prerendering
      return new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      });
    } catch (error) {
      console.error('Failed to create QueryClient:', error);
      // Fallback: create a basic client even if there's an error
      return new QueryClient();
    }
  });
  
  useEffect(() => {
    setMounted(true);
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


