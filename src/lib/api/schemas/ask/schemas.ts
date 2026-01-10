import { z } from "zod";
import { BaseDTO, MonetaID } from "@/lib/api/schemas/shared/schemas";

/** Ask Status enum */
export const AskStatus = z.enum(["ACTIVE", "WITHDRAWN", "SUSPENDED"]);
export type AskStatus = z.infer<typeof AskStatus>;

/** Ask Execution Mode enum */
export const AskExecutionMode = z.enum(["MANUAL", "AUTO"]);
export type AskExecutionMode = z.infer<typeof AskExecutionMode>;

/** Ask (response model) */
export const Ask = BaseDTO.extend({
  updatedAt: z.string().optional(),
  listingId: MonetaID,
  askerCompanyId: MonetaID,
  askerUserId: MonetaID,
  amount: z.number(),
  currency: z.string().min(3).max(3),
  validUntil: z.string(),
  status: AskStatus,
  executionMode: AskExecutionMode,
  binding: z.boolean(),
  listing: z.any().nullable().optional(), // Listing type when included
});
export type Ask = z.infer<typeof Ask>;

/** AskFilters (request body for POST /v1/ask/search) */
export const AskFilters = z.object({
  listingId: z.array(MonetaID).optional(),
  askerCompanyId: z.array(MonetaID).optional(),
  askerUserId: z.array(MonetaID).optional(),
  status: AskStatus.optional(),
  executionMode: AskExecutionMode.optional(),
  binding: z.boolean().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  currency: z.string().min(3).max(3).optional(),
  sort: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
});
export type AskFilters = z.infer<typeof AskFilters>;
