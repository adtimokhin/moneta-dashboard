// hooks/use-require-auth.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/persist/auth/store";

/**
 * Hook to require authentication for a page/component
 * Redirects to login if not authenticated
 * Waits for Zustand store to hydrate before checking
 */
export function useRequireAuth(
  options = {}
) {
  const { redirectTo = "/login", checkExpiry = true } = options;

  const router = useRouter();
  const { accessToken, accessExp, clear, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // IMPORTANT: Wait for store to hydrate from localStorage
    if (!_hasHydrated) {
      return; // Exit early, don't check auth yet
    }

    const checkAuth = () => {
      // Check if token exists
      if (!accessToken) {
        router.push(redirectTo);
        return;
      }

      // Optionally check if token is expired
      if (checkExpiry && accessExp) {
        const now = Math.floor(Date.now() / 1000);
        if (now > accessExp) {
          clear(); // Clear expired token
          router.push(redirectTo);
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [
    accessToken,
    accessExp,
    clear,
    router,
    redirectTo,
    checkExpiry,
    _hasHydrated,
  ]);

  return {
    isAuthenticated: !!accessToken,
    isChecking: isChecking || !_hasHydrated, // Still checking if not hydrated
    accessToken,
  };
}
