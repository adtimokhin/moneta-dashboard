import { z } from "zod";
import {
  BaseDTO,
  MonetaID,
  InstrumentStatus,
  MaturityStatus,
  TradingStatus,
} from "@/lib/api/schemas/shared/schemas";

/** InstrumentDocument (linked document model) */
export const InstrumentDocument = z.object({
  id: MonetaID,
  createdAt: z.string(),
  instrumentId: MonetaID,
  documentId: MonetaID,
  document: z
    .object({
      id: MonetaID,
      createdAt: z.string(),
      name: z.string(),
      mimeType: z.string().optional(),
      size: z.number().optional(),
      url: z.string().optional(),
    })
    .nullable()
    .optional(),
});
export type InstrumentDocument = z.infer<typeof InstrumentDocument>;

/** Instrument (response model) */
export const Instrument = BaseDTO.extend({
  name: z.string(),
  faceValue: z.number(),
  currency: z.string().min(3).max(3),
  maturityDate: z.string(), // ISO date; switch to z.coerce.date() if you prefer Date objects
  maturityPayment: z.number(),
  instrumentStatus: InstrumentStatus,
  maturityStatus: MaturityStatus,
  tradingStatus: TradingStatus,
  issuerId: MonetaID,
  createdBy: MonetaID,
  publicPayload: z.record(z.string(), z.any()).nullable().optional(), // Custom public metadata
  instrumentDocuments: z.array(InstrumentDocument).nullable().optional(), // Associated documents (when included)
});
export type Instrument = z.infer<typeof Instrument>;

/** InstrumentCreate (request body) */
export const InstrumentCreate = z.object({
  name: z.string(),
  faceValue: z.number(),
  currency: z.string().min(3).max(3),
  maturityDate: z.string(), // or z.coerce.date()
  maturityPayment: z.number(),
});
export type InstrumentCreate = z.infer<typeof InstrumentCreate>;

/** InstrumentDRAFTUpdate (request body for PATCH /v1/instrument/{id}) */
export const InstrumentDRAFTUpdate = z.object({
  name: z.string().optional(),
  faceValue: z.number().optional(),
  currency: z.string().min(3).max(3).optional(),
  maturityDate: z.string().optional(),
  maturityPayment: z.number().optional(),
});
export type InstrumentDRAFTUpdate = z.infer<typeof InstrumentDRAFTUpdate>;

/** InstrumentTransitionRequest (body for /v1/instrument/{id}/transition) */
export const InstrumentTransitionRequest = z.object({
  newStatus: InstrumentStatus,
});
export type InstrumentTransitionRequest = z.infer<
  typeof InstrumentTransitionRequest
>;

/** InstrumentFilters (request body for POST /v1/instrument/search) */
export const InstrumentFilters = z.object({
  // numeric bounds
  minFaceValue: z.number().optional(),
  maxFaceValue: z.number().optional(),

  currency: z.string().min(3).max(3).optional(),

  // date ranges (string ISO; backend expects dates, CamelModel → camelCase)
  maturityDateAfter: z.string().optional(),
  maturityDateBefore: z.string().optional(),
  createdAtAfter: z.string().optional(),
  createdAtBefore: z.string().optional(),

  minMaturityPayment: z.number().optional(),
  maxMaturityPayment: z.number().optional(),

  instrumentStatus: InstrumentStatus.optional(),
  maturityStatus: MaturityStatus.optional(),
  tradingStatus: TradingStatus.optional(),

  // arrays of IDs
  issuerId: z.array(MonetaID).optional(),
  createdBy: z.array(MonetaID).optional(),

  sort: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
});
export type InstrumentFilters = z.infer<typeof InstrumentFilters>;
