import { useMutation } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";
import { refreshAccessTokenForOnchain } from "@/utils/auth/privyToken";

export type RepayLoanRequest = {
  tokenAddress: string;
  amount: string;
  chainId: string;
  loanId: string | number;
};

export type RepayLoanResponse = {
  data: string;
};


const repayLoanFn = async (payload: RepayLoanRequest): Promise<RepayLoanResponse> => {
  // Refresh token proactively before onchain operation
  const token = await refreshAccessTokenForOnchain();
  console.log("[Repay Loan] Starting onchain transaction with refreshed token");
  
  const res = await postFetch<RepayLoanResponse, RepayLoanRequest>("/lending/repay-loan", payload);
  return res.data;
};

export const useRepayLoan = () => {
  return useMutation<RepayLoanResponse, Error, RepayLoanRequest>({
    mutationFn: repayLoanFn,
  });
};