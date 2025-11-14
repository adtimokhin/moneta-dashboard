import { z } from "zod";
import { BaseDTO } from "@/lib/api/schemas/shared/schemas";

/** Company (response model) */
export const Company = BaseDTO.extend({
  legalName: z.string(),
  tradeName: z.string(),
  registrationNumber: z.string(),
  // Backend sends a date; keep as ISO string for consistency with createdAt
  incorporationDate: z.string(), // switch to z.coerce.date() if you prefer Date objects
});
export type Company = z.infer<typeof Company>;

/** CompanyCreate (request body) */
export const CompanyCreate = z.object({
  legalName: z.string(),
  tradeName: z.string(),
  registrationNumber: z.string(),
  incorporationDate: z.string(), // or z.coerce.date()
});
export type CompanyCreate = z.infer<typeof CompanyCreate>;
