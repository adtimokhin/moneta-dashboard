import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCompanies, createCompany, searchCompanies, getCompanyById } from "./service";
import { companiesKeys } from "./queries";
import type { CompanyCreate, CompanyFilters, IncludeOption } from "./schemas";

type UseCompaniesOptions = {
  enabled?: boolean;
};


export function useCompanies(options?: UseCompaniesOptions) {
  return useQuery({
    queryKey: companiesKeys.list({}),
    queryFn: listCompanies,
    enabled: options?.enabled,
  });
}

export function useSearchCompanies(
  filters: CompanyFilters,
  include?: IncludeOption[],
  options?: UseCompaniesOptions
) {
  return useQuery({
    queryKey: companiesKeys.list(filters),
    queryFn: () => searchCompanies(filters, include),
    enabled: options?.enabled,
  });
}

export function useCompany(
  companyId: string | undefined,
  include?: IncludeOption[],
  options?: UseCompaniesOptions
) {
  return useQuery({
    queryKey: companiesKeys.detail(companyId ?? "unknown", include),
    queryFn: () => getCompanyById(companyId as string, include),
    enabled: (options?.enabled ?? true) && !!companyId,
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
