import type { AskFilters } from "./schemas";

export const asksKeys = {
  all: ["asks"] as const,
  lists: () => [...asksKeys.all, "list"] as const,
  list: (filters: AskFilters, include?: string) =>
    [...asksKeys.lists(), { filters, include }] as const,
  details: () => [...asksKeys.all, "detail"] as const,
  detail: (id: string, include?: string) =>
    [...asksKeys.details(), id, { include }] as const,
};
