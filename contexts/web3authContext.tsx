import { type Web3AuthContextConfig } from '@web3auth/modal/react'
import { WEB3AUTH_NETWORK, type Web3AuthOptions } from '@web3auth/modal'
import { envVars } from '@/utils/config/envVars'

const web3AuthOptions: Web3AuthOptions = {
  clientId: envVars.WEB3AUTH_CLIENT_ID, 
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // or WEB3AUTH_NETWORK.SAPPHIRE_DEVNET
}

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
}

export default web3AuthContextConfig