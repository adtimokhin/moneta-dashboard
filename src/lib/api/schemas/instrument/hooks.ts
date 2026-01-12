import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchInstruments,
  getInstrument,
  createInstrument,
  updateDraftInstrument,
  transitionInstrument,
} from "./service";
import { instrumentsKeys } from "./queries";
import type {
  InstrumentCreate,
  InstrumentDRAFTUpdate,
  InstrumentFilters,
  InstrumentTransitionRequest,
} from "./schemas";

/**
 * Search instruments with filters (backed by POST /v1/instrument/search).
 * Pass `{}` to get the default page.
 */
export function useSearchInstruments(filters: InstrumentFilters, include?: string) {
  return useQuery({
    queryKey: instrumentsKeys.list(filters, include),
    queryFn: () => searchInstruments(filters, include),
  });
}

/** Get a single instrument by id */
export function useInstrument(id: string | undefined, include?: string) {
  return useQuery({
    queryKey: instrumentsKeys.detail(id ?? "unknown", include),
    queryFn: () => getInstrument(id as string, include),
    enabled: !!id,
  });
}

/** Create a new instrument */
export function useCreateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InstrumentCreate) => createInstrument(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instrumentsKeys.all });
    },
  });
}

/** Update a drafted instrument (PATCH) */
export function useUpdateDraftInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; data: InstrumentDRAFTUpdate }) =>
      updateDraftInstrument(args.id, args.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: instrumentsKeys.all });
      qc.invalidateQueries({ queryKey: instrumentsKeys.detail(id) });
    },
  });
}

/** Transition instrument status (POST /{id}/transition) */
export function useTransitionInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: InstrumentTransitionRequest }) =>
      transitionInstrument(args.id, args.body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: instrumentsKeys.all });
      qc.invalidateQueries({ queryKey: instrumentsKeys.detail(id) });
    },
  });
}
