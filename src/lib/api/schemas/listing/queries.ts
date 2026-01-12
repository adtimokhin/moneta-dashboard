import type { ListingFilters } from "./schemas";

export const listingsKeys = {
  all: ["listings"] as const,
  lists: () => [...listingsKeys.all, "list"] as const,
  list: (filters: ListingFilters, include?: string) =>
    [...listingsKeys.lists(), { filters, include }] as const,
  details: () => [...listingsKeys.all, "detail"] as const,
  detail: (id: string, include?: string) =>
    [...listingsKeys.details(), id, { include }] as const,
};
