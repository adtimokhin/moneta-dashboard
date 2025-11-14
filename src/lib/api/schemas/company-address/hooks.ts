import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCompanyAddresses, createCompanyAddress } from "./service";
import { companyAddressKeys } from "./queries";
import type { CompanyAddressCreate } from "./schemas";

export function useCompanyAddresses() {
  return useQuery({
    queryKey: companyAddressKeys.list({}),
    queryFn: listCompanyAddresses,
    // optional:
    // refetchInterval: false,
    // refetchOnWindowFocus: false,
    // staleTime: 5 * 60_000,
  });
}

export function useCreateCompanyAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyAddressCreate) =>
      createCompanyAddress(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyAddressKeys.all });
    },
  });
}
