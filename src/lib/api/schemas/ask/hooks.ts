import { useQuery } from "@tanstack/react-query";
import { searchAsks, getAsk } from "./service";
import { asksKeys } from "./queries";
import type { AskFilters } from "./schemas";

/**
 * Search asks with filters (backed by POST /v1/ask/search).
 * Pass `{}` to get the default page.
 */
export function useSearchAsks(filters: AskFilters, include?: string) {
  return useQuery({
    queryKey: asksKeys.list(filters, include),
    queryFn: () => searchAsks(filters, include),
  });
}

/** Get a single ask by id */
export function useAsk(id: string | undefined, include?: string) {
  return useQuery({
    queryKey: asksKeys.detail(id ?? "unknown", include),
    queryFn: () => getAsk(id as string, include),
    enabled: !!id,
  });
}
