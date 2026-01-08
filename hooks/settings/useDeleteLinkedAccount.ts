import { useMutation } from "@tanstack/react-query";
import { deleteFetch } from "@/utils/api/fetch";

const deleteLinkedAccountFn = async (bankAccountId: string): Promise<void> => {
  await deleteFetch(`/off-ramp/bank-accounts/${bankAccountId}`);
};

export const useDeleteLinkedAccount = () => {
  return useMutation<void, Error, string>({
    mutationFn: deleteLinkedAccountFn,
  });
};

