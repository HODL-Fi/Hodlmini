export const envVars = {
  // Base URL for the API
  api: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",

  PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,

  PRIVY_CLIENT_ID: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!,

  // Example: Google Analytics ID
};
