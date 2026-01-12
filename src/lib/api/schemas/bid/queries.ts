import type { BidFilters } from "./schemas";

export const bidsKeys = {
  all: ["bids"] as const,
  lists: () => [...bidsKeys.all, "list"] as const,
  list: (filters: BidFilters, include?: string) =>
    [...bidsKeys.lists(), { filters, include }] as const,
  details: () => [...bidsKeys.all, "detail"] as const,
  detail: (id: string, include?: string) =>
    [...bidsKeys.details(), id, { include }] as const,
};
