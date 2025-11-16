import { useAuthStore } from "../persist/auth/store";
import { api } from "./client";
import { EP } from "./endpoints";
import { toApiError } from "./errors";

/**
 * Get current access token
 * Use this in non-React contexts (e.g., axios interceptors)
 */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

/**
 * Clear all auth state
 * Call this on logout or when token is invalid
 */
export function clearAuth(): void {
  useAuthStore.getState().clear();
}

/**
 * Check if store has finished loading from localStorage
 * Useful for preventing premature redirects
 */
export function hasHydrated(): boolean {
  return useAuthStore.getState()._hasHydrated;
}

/**
 * Login credentials
 */
export type LoginPayload = {
  email: string;
  password: string;
};

/**
 * Login response from server
 */
export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_at?: number;
};

/**
 * Login with email and password
 * Stores the access token in the store and localStorage
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const { data } = await api.post<LoginResponse>(
      EP.v1.login(),
      { email: payload.email, password: payload.password },
      { headers: { "Content-Type": "application/json" } }
    );

    // Your server returns: { "access_token": "...", "token_type": "bearer" }
    const token: string | null = data?.access_token ?? null;

    // If your server returns token expiry, extract it here
    const exp: number | null = data?.expires_at ?? null;

    useAuthStore.getState().setAccessToken({
      accessToken: token,
      accessExp: exp,
    });

    return data;
  } catch (e) {
    throw toApiError(e);
  }
}

/**
 * Logout user
 * Optionally calls server logout endpoint, always clears local state
 */
export async function logout(): Promise<void> {
  try {
    // Only call if you have a logout endpoint
    if (EP.v1.logout()) {
      await api.post(EP.v1.logout());
    }
  } catch {
    // Ignore logout network errors
    // Still clear local state even if server request fails
  } finally {
    clearAuth();
  }
}

/**
 * Check if user is authenticated
 * Note: This is synchronous, use in components with useAuthStore hook
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Check if token is expired
 * Only works if you store accessExp
 */
export function isTokenExpired(): boolean {
  const { accessExp } = useAuthStore.getState();
  if (!accessExp) return false;

  const now = Math.floor(Date.now() / 1000);
  return now > accessExp;
}