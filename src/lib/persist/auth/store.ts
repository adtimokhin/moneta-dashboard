// src/lib/persist/auth/store.ts
import { createPersistedStore } from "@/lib/persist/storage";

/**
 * Auth state shape
 */
export type AuthState = {
  // Auth data
  accessToken: string | null;
  accessExp: number | null;

  // Hydration tracking (fixes initial load issue)
  _hasHydrated: boolean;

  // Actions
  setAccessToken: (p: {
    accessToken: string | null;
    accessExp?: number | null;
  }) => void;
  clear: () => void;
  setHasHydrated: (state: boolean) => void;
};

/** Slice of AuthState that we actually persist */
type AuthPersistedSlice = Pick<AuthState, "accessToken" | "accessExp">;

/**
 * Auth store with persist middleware
 * Automatically saves/loads token from localStorage
 */
export const useAuthStore = createPersistedStore<AuthState, AuthPersistedSlice>(
  "auth-storage",
  (set) => ({
    // Auth state
    accessToken: null,
    accessExp: null,

    // Hydration tracking
    _hasHydrated: false,

    // Actions
    setAccessToken: ({ accessToken, accessExp }) =>
      set({ accessToken, accessExp: accessExp ?? null }),

    clear: () => set({ accessToken: null, accessExp: null }),

    setHasHydrated: (state) => set({ _hasHydrated: state }),
  }),
  {
    // Only persist these fields (not _hasHydrated)
    partialize: (state) => ({
      accessToken: state.accessToken,
      accessExp: state.accessExp,
    }),

    // Called after rehydration from localStorage completes
    onRehydrateStorage: () => (state) => {
      state?.setHasHydrated(true);
    },
  }
);
