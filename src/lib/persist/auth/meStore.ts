/**
 * Specific Store for storing information about currently logged in user
 * into the system.
 * 
 * Note: This is NOT authentication source of truth! It only relates to
 * exact data about the user.
 */
import { createPersistedStore } from "@/lib/persist/storage";
import type { User } from "@/lib/api/schemas/user/schemas";

/**
 * Persisted state for the current authenticated user's profile (/me).
 */
export type MeState = {
  me: User | null;

  setMe: (user: User | null) => void;
  clearMe: () => void;
};

export const useMeStore = createPersistedStore<MeState>(
  "auth.me", // localStorage key
  (set) => ({
    me: null,

    setMe: (user) => set({ me: user }),
    clearMe: () => set({ me: null }),
  })
);
