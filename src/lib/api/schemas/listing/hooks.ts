import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchListings,
  getListing,
  createListing,
  transitionListing,
} from "./service";
import { listingsKeys } from "./queries";
import type { ListingFilters, ListingCreate, ListingTransition } from "./schemas";

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

/** Create a new listing */
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingData: ListingCreate) => createListing(listingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingsKeys.all });
    },
  });
}

/** Transition a listing's status */
export function useTransitionListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      transition,
    }: {
      id: string;
      transition: ListingTransition;
    }) => transitionListing(id, transition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingsKeys.all });
    },
  });
}
