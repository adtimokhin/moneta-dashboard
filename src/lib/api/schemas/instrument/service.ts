import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas";
import {
  Instrument,
  InstrumentCreate,
  InstrumentDRAFTUpdate,
  InstrumentFilters,
  InstrumentTransitionRequest,
} from "./schemas";

const zInstruments = arrayOf(Instrument);

/** POST /v1/instrument/search → Instrument[] */
export async function searchInstruments(
  filters: InstrumentFilters
): Promise<z.infer<typeof zInstruments>> {
  const { data } = await api.post("/v1/instrument/search", filters, {
    headers: { "Content-Type": "application/json" },
  });
  return zInstruments.parse(data);
}

/** GET /v1/instrument/{id} → Instrument */
export async function getInstrument(id: string): Promise<Instrument> {
  const { data } = await api.get(`/v1/instrument/${id}`);
  return Instrument.parse(data);
}

/** POST /v1/instrument → Instrument */
export async function createInstrument(
  payload: InstrumentCreate
): Promise<Instrument> {
  const { data } = await api.post("/v1/instrument", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return Instrument.parse(data);
}

/** PATCH /v1/instrument/{id} → Instrument */
export async function updateDraftInstrument(
  id: string,
  payload: InstrumentDRAFTUpdate
): Promise<Instrument> {
  const { data } = await api.patch(`/v1/instrument/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return Instrument.parse(data);
}

/** POST /v1/instrument/{id}/transition → Instrument */
export async function transitionInstrument(
  id: string,
  body: InstrumentTransitionRequest
): Promise<Instrument> {
  const { data } = await api.post(`/v1/instrument/${id}/transition`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return Instrument.parse(data);
}
