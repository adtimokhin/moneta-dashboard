import { z } from "zod";
import { BaseDTO, MonetaID } from "@/lib/api/schemas/shared/schemas";

/** Bid Status enum */
export const BidStatus = z.enum([
  "PENDING",
  "WITHDRAWN",
  "SUSPENDED",
  "SELECTED",
  "NOT_SELECTED",
]);
export type BidStatus = z.infer<typeof BidStatus>;

/** Bid (response model) */
export const Bid = BaseDTO.extend({
  updatedAt: z.string().optional(),
  listingId: MonetaID,
  bidderCompanyId: MonetaID,
  bidderUserId: MonetaID,
  amount: z.number(),
  currency: z.string().min(3).max(3),
  validUntil: z.string(),
  status: BidStatus,
  listing: z.any().nullable().optional(), // Listing type when included
});
export type Bid = z.infer<typeof Bid>;

/** BidFilters (request body for POST /v1/bid/search) */
export const BidFilters = z.object({
  listingId: z.array(MonetaID).optional(),
  bidderCompanyId: z.array(MonetaID).optional(),
  bidderUserId: z.array(MonetaID).optional(),
  status: BidStatus.optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  currency: z.string().min(3).max(3).optional(),
  sort: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
});
export type BidFilters = z.infer<typeof BidFilters>;
