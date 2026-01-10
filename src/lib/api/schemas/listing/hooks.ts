import { useQuery } from "@tanstack/react-query";
import { searchListings, getListing } from "./service";
import { listingsKeys } from "./queries";
import type { ListingFilters } from "./schemas";

/**
 * Search listings with filters (backed by POST /v1/listing/search).
 * Pass `{}` to get the default page.
 */
export function useSearchListings(filters: ListingFilters, include?: string) {
  return useQuery({
    queryKey: listingsKeys.list(filters, include),
    queryFn: () => searchListings(filters, include),
  });
}

/** Get a single listing by id */
export function useListing(id: string | undefined, include?: string) {
  return useQuery({
    queryKey: listingsKeys.detail(id ?? "unknown", include),
    queryFn: () => getListing(id as string, include),
    enabled: !!id,
  });
}
