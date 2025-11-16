import { createPersistedStore } from "../storage";
import type { CompanyFilters } from "@/lib/api/schemas/company/schemas";

export interface CompanyFiltersState {
  filters: CompanyFilters | null;
  setFilters: (filters: CompanyFilters) => void;
  updateFilters: (partial: Partial<CompanyFilters>) => void;
  clearFilters: () => void;
}

export const useCompanyFiltersStore = createPersistedStore<CompanyFiltersState>(
  "filters.companies",
  (set, get) => ({
    filters: null,

    setFilters: (filters) => set({ filters }),

    updateFilters: (partial) =>
      set({
        filters: {
          ...(get().filters ?? ({} as CompanyFilters)),
          ...partial,
        },
      }),

    clearFilters: () => set({ filters: null }),
  })
);
