import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCompanies, createCompany, searchCompanies, getCompanyById } from "./service";
import { companiesKeys } from "./queries";
import type { CompanyCreate, CompanyFilters } from "./schemas";

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

export function useSearchCompanies(filters: CompanyFilters) {
  return useQuery({
    queryKey: companiesKeys.list(filters),
    queryFn: () => searchCompanies(filters),
  });
}

export function useCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: companiesKeys.detail(companyId ?? "unknown"),
    queryFn: () => getCompanyById(companyId as string),
    enabled: !!companyId,
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
