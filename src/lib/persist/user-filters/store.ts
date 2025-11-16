import { createPersistedStore } from "../storage";
import type { UserFilters } from "@/lib/api/schemas/user/schemas";

export interface UserFiltersState {
  filters: UserFilters | null;
  setFilters: (filters: UserFilters) => void;
  updateFilters: (partial: Partial<UserFilters>) => void;
  clearFilters: () => void;
}

export const useUserFiltersStore = createPersistedStore<UserFiltersState>(
  "filters.users",
  (set, get) => ({
    filters: null,

    setFilters: (filters) => set({ filters }),

    updateFilters: (partial) =>
      set({
        filters: {
          ...(get().filters ?? ({} as UserFilters)),
          ...partial,
        },
      }),

    clearFilters: () => set({ filters: null }),
  })
);
