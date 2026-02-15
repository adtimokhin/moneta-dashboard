import { z } from "zod";
import { BaseDTO, arrayOf } from "@/lib/api/schemas/shared/schemas";
import { CompanyAddress } from "@/lib/api/schemas/company-address/schemas";
import { Instrument } from "@/lib/api/schemas/instrument/schemas";

/** Company (response model) */
export const Company = BaseDTO.extend({
  legalName: z.string(),
  tradeName: z.string().nullable(), // Can be null in backend
  registrationNumber: z.string(),
  // Backend sends a date; keep as ISO string for consistency with createdAt
  incorporationDate: z.string(), // switch to z.coerce.date() if you prefer Date objects
  // Optional includes from backend
  addresses: arrayOf(CompanyAddress).nullable().optional(),
  instruments: arrayOf(Instrument).nullable().optional(),
});

/** CompanyCreate (request body) */
export const CompanyCreate = z.object({
  legalName: z.string(),
  tradeName: z.string(),
  registrationNumber: z.string(),
  incorporationDate: z.string(), // or z.coerce.date()
});

/** CompanyFilters (request body for /v1/company/search) */
export const CompanyFilters = z.object({
  // partial text matches (camelCase → legal_name, trade_name, registration_number)
  legalName: z.string().optional(),
  tradeName: z.string().optional(),
  registrationNumber: z.string().optional(),

  // date ranges (camelCase → *_after / *_before)
  incorporationDateAfter: z.string().optional(),
  incorporationDateBefore: z.string().optional(),
  createdAtAfter: z.string().optional(),
  createdAtBefore: z.string().optional(),

  // sorting & pagination
  sort: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),

  // include related entities (for search endpoint)
  include: z.array(z.enum(["addresses", "instruments", "users"])).optional(),
});

export type IncludeOption = "addresses" | "instruments" | "users";
export type Company = z.infer<typeof Company>;
export type CompanyCreate = z.infer<typeof CompanyCreate>;
export type CompanyFilters = z.infer<typeof CompanyFilters>;

