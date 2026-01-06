import { useQuery } from "@tanstack/react-query";
import { postFetch } from "@/utils/api/fetch";

export interface ActiveLoanPosition {
  loanId: number;
  positionId: number;
  token: string;
  principal: string | number;
  repaid: string | number;
  tenureSecond: number;
  startTimestamp: number;
  debt: string | number;
  annualRateBps: number;
  penaltyRateBps: number;
  status: number;
}

export type ActiveLoanPositionsByChain = Record<string, ActiveLoanPosition[]>;

const useGetActiveLoanPositions = (chainIds: Array<string | number>) => {
  const chainIdStrings = chainIds.map(String).sort();

  return useQuery<ActiveLoanPositionsByChain, Error>({
    queryKey: ["active_loan_positions", ...chainIdStrings],
    queryFn: async () => {
      if (chainIdStrings.length === 0) return {};
      const res = await postFetch<ActiveLoanPositionsByChain, { chainIds: string[] }>(
        "/lending/active-loan-positions",
        { chainIds: chainIdStrings }
      );
      return res.data;
    },
    enabled: chainIdStrings.length > 0,
    staleTime: 30000, // 30 seconds - loans can change frequently
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export default useGetActiveLoanPositions;

