import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchBids, getBid, createBid } from "./service";
import { bidsKeys } from "./queries";
import type { BidFilters, BidCreate } from "./schemas";

/**
 * Search bids with filters (backed by POST /v1/bid/search).
 * Pass `{}` to get the default page.
 */
export function useSearchBids(filters: BidFilters, include?: string) {
  return useQuery({
    queryKey: bidsKeys.list(filters, include),
    queryFn: () => searchBids(filters, include),
  });
}

/** Get a single bid by id */
export function useBid(id: string | undefined, include?: string) {
  return useQuery({
    queryKey: bidsKeys.detail(id ?? "unknown", include),
    queryFn: () => getBid(id as string, include),
    enabled: !!id,
  });
}

/** Create a new bid */
export function useCreateBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidData: BidCreate) => createBid(bidData),
    onSuccess: () => {
      // Invalidate bid queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: bidsKeys.all });
    },
  });
}
