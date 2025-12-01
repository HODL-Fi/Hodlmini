import { type Web3AuthContextConfig } from '@web3auth/modal/react'
import {
  WALLET_CONNECTORS,
  WEB3AUTH_NETWORK,
  MFA_LEVELS,
  type Web3AuthOptions,
  AUTH_CONNECTION,
} from '@web3auth/modal'

import { envVars } from '@/utils/config/envVars'

const web3AuthOptions: Web3AuthOptions = {
  clientId: envVars.WEB3AUTH_CLIENT_ID, 
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // or WEB3AUTH_NETWORK.SAPPHIRE_DEVNET
   modalConfig: {
    connectors: {
      [WALLET_CONNECTORS.AUTH]: {
        label: 'auth',
        loginMethods: {
          google: {
            name: 'google login',
            logoDark: "https://app.joinhodl.com/logos/HODL_Primary_BlockBlue.png",
            showOnModal: true,
            authConnection: AUTH_CONNECTION.GOOGLE,
            authConnectionId: "hodl-test-pha",
            
          },
        },
      },
    },
  },
  mfaLevel: MFA_LEVELS.MANDATORY,
}


const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
}

export default web3AuthContextConfig