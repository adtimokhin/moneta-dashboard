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
import { EP } from "../../endpoints";

const zInstruments = arrayOf(Instrument);

/** POST /v1/instrument/search → Instrument[] */
export async function searchInstruments(
  filters: InstrumentFilters,
  include?: string
): Promise<z.infer<typeof zInstruments>> {
  const params = include ? { include } : {};
  const { data } = await api.post(EP.v1.instrumentSearch(), filters, {
    headers: { "Content-Type": "application/json" },
    params,
  });
  return zInstruments.parse(data);
}

/** GET /v1/instrument/{id} → Instrument */
export async function getInstrument(
  id: string,
  include?: string
): Promise<Instrument> {
  const params = include ? { include } : {};
  const { data } = await api.get(EP.v1.instrumentGetById(id), { params });
  return Instrument.parse(data);
}

/** POST /v1/instrument → Instrument */
export async function createInstrument(
  payload: InstrumentCreate
): Promise<Instrument> {
  const { data } = await api.post(EP.v1.instrumentCreate(), payload, {
    headers: { "Content-Type": "application/json" },
  });
  return Instrument.parse(data);
}

/** PATCH /v1/instrument/{id} → Instrument */
export async function updateDraftInstrument(
  id: string,
  payload: InstrumentDRAFTUpdate
): Promise<Instrument> {
  const { data } = await api.patch(
    EP.v1.instrumentUpdateDraftById(id),
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return Instrument.parse(data);
}

/** POST /v1/instrument/{id}/transition → Instrument */
export async function transitionInstrument(
  id: string,
  body: InstrumentTransitionRequest
): Promise<Instrument> {
  const { data } = await api.post(EP.v1.instrumentTransition(id), body, {
    headers: { "Content-Type": "application/json" },
  });
  return Instrument.parse(data);
}
