import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from "axios";
import { getAccessToken, clearAuth } from "./auth";
import { toApiError } from "./errors";

/** Resolve base URL from env or runtime override, defaulting to /api */
function resolveBaseURL(): string {
  const fromProcess =
    (typeof process !== "undefined" &&
      (process as any).env &&
      ((process as any).env.NEXT_PUBLIC_API_BASE_URL ||
        (process as any).env.VITE_API_URL ||
        (process as any).env.REACT_APP_API_URL)) ||
    "";
  const fromGlobal =
    (typeof globalThis !== "undefined" &&
      (globalThis as any).__API_BASE_URL__) ||
    "";
  return (fromProcess || fromGlobal || "https://moneta-app-production.up.railway.app") as string;
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15_000,
});

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

/** Ensure headers are an AxiosHeaders we can safely mutate */
function ensureHeaders(cfg: AxiosRequestConfig): AxiosHeaders {
  const current = cfg.headers as any;
  if (current instanceof AxiosHeaders) return current;
  const h = new AxiosHeaders(current ?? {});
  cfg.headers = h;
  return h;
}

/** Treat these as auth endpoints; never attach Authorization or run special logic */
function isAuthPath(url?: string) {
  if (!url) return false;
  // Adjust to your exact routes if they differ
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/refresh")
  );
}

/* ---------- REQUEST interceptor ---------- */
api.interceptors.request.use((config) => {
  // Do NOT attach Authorization on auth endpoints
  if (!isAuthPath(config.url)) {
    const token = getAccessToken();
    if (token) {
      const h = ensureHeaders(config);
      h.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

/* ---------- RESPONSE interceptor (no refresh flow) ---------- */
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status ?? 0;

    // If unauthorized, optionally clear auth so the UI can redirect to /login
    if (status === 401) {
      clearAuth();
    }

    // Bubble a normalized error up to callers/UI
    throw toApiError(error);
  }
);
