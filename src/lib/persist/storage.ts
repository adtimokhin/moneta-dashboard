// src/lib/persist/storage.ts
import { create } from "zustand";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";
import type { StateCreator } from "zustand";

/**
 * Helper to create a persisted Zustand store.
 *
 * T = full state type used in the app
 * P = subset of T that is actually persisted (defaults to T)
 */
export function createPersistedStore<T extends object, P = T>(
  storageKey: string,
  initializer: StateCreator<T>,
  extraOptions?: Omit<PersistOptions<T, P>, "name" | "storage">
) {
  return create<T>()(
    persist(initializer, {
      name: storageKey,
      storage: createJSONStorage(() => localStorage),
      ...(extraOptions ?? {}),
    } as PersistOptions<T, P>)
  );
}
