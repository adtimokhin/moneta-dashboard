import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCompanies, createCompany } from "./service";
import { companiesKeys } from "./queries";
import type { CompanyCreate } from "./schemas";

export function useCompanies() {
  return useQuery({
    queryKey: companiesKeys.list({}),
    queryFn: listCompanies,
    // optional calming of refetch behavior:
    // refetchInterval: false,
    // refetchOnWindowFocus: false,
    // staleTime: 5 * 60_000,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyCreate) => createCompany(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companiesKeys.all });
    },
  });
}
