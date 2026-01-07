'use client';

import { ReactNode } from 'react';
import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth';
import { envVars } from '@/utils/config/envVars';

// Configure Privy settings
const privyConfig: PrivyClientConfig = {
  // Login methods available to users
  loginMethods: [
    'email',        // Email OTP (one-time password)
    'google',       // Google OAuth
    'apple',        // Apple Sign In
    'farcaster',    // Farcaster
  ],
  
  // UI customization
  appearance: {
    theme: 'light' as const,        // 'light' | 'dark' | 'auto'
    accentColor: '#2200FF',         // Primary brand color (hex)
    showWalletLoginFirst: false,    // Show wallet options before social logins
    walletList: [
      'detected_wallets',           // Auto-detect installed wallets
      'metamask',                   // MetaMask
      'coinbase_wallet',            // Coinbase Wallet
      'wallet_connect',             // WalletConnect
    ],
  },
  
  // Embedded wallet configuration
  embeddedWallets: {
    // Don't auto-create embedded wallets
    ethereum: {
      createOnLogin: 'off' as const,
    },
    solana: {
      createOnLogin: 'off' as const,
    },
  },
};

// Provider component
export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const appId = envVars.PRIVY_APP_ID;
  const clientId = envVars.PRIVY_CLIENT_ID || undefined;

  // Graceful fallback if App ID is missing
  if (!appId) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Missing NEXT_PUBLIC_PRIVY_APP_ID. PrivyProvider is not mounted.');
    }
    return <>{children}</>;
  }

  return (
    <PrivyProvider 
      appId={appId} 
      {...(clientId && { clientId })} 
      config={privyConfig}
    >
      {children}
    </PrivyProvider>
  );
}


