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
export type User = z.infer<typeof User>;

/** UserCreate (request body) */
export const UserCreate = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(1),
  companyId: MonetaID,
  role: UserRole,
});
export type UserCreate = z.infer<typeof UserCreate>;

/** (Future) UserUpdate shape, matching your backend class */
export const UserUpdate = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(1),
});
export type UserUpdate = z.infer<typeof UserUpdate>;
