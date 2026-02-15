import { createPersistedStore } from "../storage";
import type { InstrumentFilters } from "@/lib/api/schemas/instrument/schemas";

export interface InstrumentFiltersState {
  filters: InstrumentFilters | null;
  setFilters: (filters: InstrumentFilters) => void;
  updateFilters: (partial: Partial<InstrumentFilters>) => void;
  clearFilters: () => void;
}

export const useInstrumentFiltersStore =
  createPersistedStore<InstrumentFiltersState>(
    "filters.instruments",
    (set, get) => ({
      filters: null,

      setFilters: (filters) => set({ filters }),

      updateFilters: (partial) =>
        set({
          filters: {
            ...(get().filters ?? ({} as InstrumentFilters)),
            ...partial,
          },
        }),

      clearFilters: () => set({ filters: null }),
    })
  );
