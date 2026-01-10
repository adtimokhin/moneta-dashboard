import { z } from "zod";
import { BaseDTO, MonetaID } from "@/lib/api/schemas/shared/schemas";

/** Listing Status enum */
export const ListingStatus = z.enum([
  "OPEN",
  "WITHDRAWN",
  "SUSPENDED",
  "CLOSED",
]);
export type ListingStatus = z.infer<typeof ListingStatus>;

/** Listing (response model) */
export const Listing = BaseDTO.extend({
  updatedAt: z.string().optional(),
  instrumentId: MonetaID,
  sellerCompanyId: MonetaID,
  listingCreatorUserId: MonetaID,
  status: ListingStatus,
  instrument: z.any().nullable().optional(), // Instrument type when included
});
export type Listing = z.infer<typeof Listing>;

/** ListingFilters (request body for POST /v1/listing/search) */
export const ListingFilters = z.object({
  instrumentId: z.array(MonetaID).optional(),
  sellerCompanyId: z.array(MonetaID).optional(),
  listingCreatorUserId: z.array(MonetaID).optional(),
  status: ListingStatus.optional(),
  sort: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
});
export type ListingFilters = z.infer<typeof ListingFilters>;
