import { z } from "zod";
import {
  BaseDTO,
  MonetaID,
  AddressType,
} from "@/lib/api/schemas/shared/schemas";

/** CompanyAddress (response DTO) */
export const CompanyAddress = BaseDTO.extend({
  type: AddressType,
  street: z.string(),
  city: z.string(),
  state: z.string().nullable().or(z.string().optional()).optional(), // backend: Optional[str] -> may be missing or null
  postalCode: z.string(),
  country: z.string(), // ISO 3166-1 alpha-2
  companyId: MonetaID,
});
export type CompanyAddress = z.infer<typeof CompanyAddress>;

/** CompanyAddressCreate (request body) */
export const CompanyAddressCreate = z.object({
  type: AddressType,
  street: z.string(),
  city: z.string(),
  state: z.string().optional().nullable(),
  postalCode: z.string(),
  country: z.string(),
  companyId: MonetaID,
});
export type CompanyAddressCreate = z.infer<typeof CompanyAddressCreate>;
