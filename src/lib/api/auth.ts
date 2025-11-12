import { create } from "zustand";
import { api } from "./client";
import { EP } from "./endpoints";
import { toApiError } from "./errors";

/** Auth state: no refresh tokens in this setup */
type AuthState = {
  accessToken: string | null;
  accessExp?: number | null;
  setAccessToken: (p: {
    accessToken: string | null;
    accessExp?: number | null;
  }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  accessExp: null,
  setAccessToken: ({ accessToken, accessExp }) =>
    set({ accessToken, accessExp: accessExp ?? null }),
  clear: () => set({ accessToken: null, accessExp: null }),
}));

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function clearAuth() {
  useAuthStore.getState().clear();
}

/** Login with JSON body { email, password }. Maps `access_token` from server into the store. */
export async function login(payload: { email: string; password: string }) {
  try {
    const { data } = await api.post(
      EP.login(), // should be "/v1/auth/login"
      { email: payload.email, password: payload.password },
      { headers: { "Content-Type": "application/json" } }
    );

    // Your server returns: { "access_token": "...", "token_type": "bearer" }
    const token: string | null = data?.access_token ?? null;

    useAuthStore.getState().setAccessToken({
      accessToken: token,
      accessExp: null, // set if your backend returns an expiry
    });

    return data;
  } catch (e) {
    throw toApiError(e);
  }
}

/** Optional server-side logout; always clear local state */
export async function logout() {
  try {
    // Only call if you have a logout endpoint
    if (EP.logout) {
      await api.post(EP.logout());
    }
  } catch {
    // ignore logout network errors
  } finally {
    clearAuth();
  }
}