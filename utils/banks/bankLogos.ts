import banksData from "../../banks.json";

type BankData = {
  id: number;
  name: string;
  slug: string;
  code: string;
  logo: string;
};

// Create lookup maps for O(1) access
const bankLogoByCodeMap = new Map<string, string>();
const bankLogoByNameMap = new Map<string, string>();
const bankNameByCodeMap = new Map<string, string>();

(banksData as BankData[]).forEach((bank) => {
  // Convert logo path from "logos/branch.png" to "/banks/branch.png"
  const logoPath = bank.logo.replace(/^logos\//, "/banks/");
  
  // Store by code (normalized to uppercase for case-insensitive lookup)
  const code = bank.code.toUpperCase();
  bankLogoByCodeMap.set(code, logoPath);
  bankNameByCodeMap.set(code, bank.name);
  
  // Store by name (normalized to lowercase for case-insensitive lookup)
  const name = bank.name.toLowerCase();
  bankLogoByNameMap.set(name, logoPath);
});

/**
 * Get bank logo path by code
 * @param code - Bank code from API (e.g., "ABNGNGLA", "044")
 * @returns Logo path (e.g., "/banks/access-bank.png") or fallback "/icons/bank.svg"
 */
export function getBankLogoByCode(code: string | null | undefined): string {
  if (!code) return "/icons/bank.svg";
  
  const normalizedCode = code.toUpperCase();
  return bankLogoByCodeMap.get(normalizedCode) || "/icons/bank.svg";
}

/**
 * Get bank logo path by name (O(1) lookup)
 * @param name - Bank name
 * @returns Logo path or fallback
 */
export function getBankLogoByName(name: string | null | undefined): string {
  if (!name) return "/icons/bank.svg";
  
  const normalizedName = name.toLowerCase();
  return bankLogoByNameMap.get(normalizedName) || "/icons/bank.svg";
}

/**
 * Get bank logo path - tries code first, then name
 * @param code - Bank code
 * @param name - Bank name
 * @returns Logo path or fallback
 */
export function getBankLogo(code?: string | null, name?: string | null): string {
  if (code) {
    const logo = getBankLogoByCode(code);
    if (logo !== "/icons/bank.svg") return logo;
  }
  
  if (name) {
    return getBankLogoByName(name);
  }
  
  return "/icons/bank.svg";
}

/**
 * Get bank name by code
 * @param code - Bank code from API (e.g., "ZEIBNGLA", "044")
 * @returns Bank name or the code itself if not found
 */
export function getBankNameByCode(code: string | null | undefined): string {
  if (!code) return "";
  
  const normalizedCode = code.toUpperCase();
  return bankNameByCodeMap.get(normalizedCode) || code;
}

