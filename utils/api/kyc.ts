import { postFetch } from "./fetch";
import axiosInstance from "./apiInstance";

export interface TierOneKycPayload {
  userId: string;
  firstName: string;
  lastName: string;
  ninNumber: string;
  bvn: string;
  dob: string; // YYYY-MM-DD format
  phone: string;
}

export interface TierTwoKycPayload {
  userId: string;
  idType: "drivers" | "passport" | "national";
  idFile: File;
  selfieFile?: File; // Optional if liveness is handled separately
}

export interface TierThreeKycPayload {
  userId: string;
  poaFile: File; // Proof of address file
  sourceOfFunds: string;
  locationCheck?: {
    latitude: number;
    longitude: number;
  };
}

export interface KycResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Tier 1 KYC - NIN and BVN verification
export const submitTierOneKyc = async (payload: TierOneKycPayload): Promise<KycResponse> => {
  try {
    const response = await postFetch<KycResponse, TierOneKycPayload>("/tier-one-kyc", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit Tier 1 KYC");
  }
};

// Tier 2 KYC - Government ID and selfie/liveness
export const submitTierTwoKyc = async (payload: TierTwoKycPayload): Promise<KycResponse> => {
  try {
    const formData = new FormData();
    formData.append("userId", payload.userId);
    formData.append("idType", payload.idType);
    formData.append("idFile", payload.idFile);
    if (payload.selfieFile) {
      formData.append("selfieFile", payload.selfieFile);
    }

    // Don't set Content-Type manually - axios will set it with boundary
    const response = await axiosInstance.post<KycResponse>("/tier-two-kyc", formData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit Tier 2 KYC");
  }
};

// Tier 3 KYC - Proof of address and source of funds
export const submitTierThreeKyc = async (payload: TierThreeKycPayload): Promise<KycResponse> => {
  try {
    const formData = new FormData();
    formData.append("userId", payload.userId);
    formData.append("poaFile", payload.poaFile);
    formData.append("sourceOfFunds", payload.sourceOfFunds);
    if (payload.locationCheck) {
      formData.append("latitude", payload.locationCheck.latitude.toString());
      formData.append("longitude", payload.locationCheck.longitude.toString());
    }

    // Don't set Content-Type manually - axios will set it with boundary
    const response = await axiosInstance.post<KycResponse>("/tier-three-kyc", formData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit Tier 3 KYC");
  }
};

