import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchAsks, getAsk, createAsk, transitionAsk } from "./service";
import { asksKeys } from "./queries";
import type { AskFilters, AskCreate, AskTransition } from "./schemas";

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

/** Create a new ask */
export function useCreateAsk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (askData: AskCreate) => createAsk(askData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asksKeys.all });
    },
  });
}

/** Transition an ask's status */
export function useTransitionAsk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, transition }: { id: string; transition: AskTransition }) =>
      transitionAsk(id, transition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: asksKeys.all });
    },
  });
}
