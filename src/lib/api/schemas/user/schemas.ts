import { z } from "zod";
import { BaseDTO, MonetaID, UserRole } from "@/lib/api/schemas/shared/schemas";

/** User (response model) */
export const User = BaseDTO.extend({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  companyId: MonetaID,
  role: UserRole,
});

/** UserCreate (request body) */
export const UserCreate = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(1),
  companyId: MonetaID,
  role: UserRole,
});

/** UserFilters (request body for /v1/user/search) */
export const UserFilters = z.object({
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: UserRole.optional(),
  companyId: MonetaID.optional(),
  createdAtAfter: z.string().optional(),
  createdAtBefore: z.string().optional(),
  sort: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
});

export type UserCreate = z.infer<typeof UserCreate>;
export type User = z.infer<typeof User>;
export type UserFilters = z.infer<typeof UserFilters>;
