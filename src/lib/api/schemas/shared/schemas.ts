import { z } from "zod";

/** Moneta UUID (server sends camelCase) */
export const MonetaID = z.string().uuid();

/** Base fields every DTO inherits (from BaseDTO on backend) */
export const BaseDTO = z.object({
  id: MonetaID,
  createdAt: z.string(), // keep as string; switch to z.coerce.date() if you prefer Date
});

/** User roles enum (shared across entities) */
export const UserRole = z.enum(["ADMIN", "BUYER", "SELLER", "ISSUER"]);
export type UserRole = z.infer<typeof UserRole>;

/** Helpers */
export const arrayOf = <S extends z.ZodTypeAny>(schema: S) => z.array(schema);
export const pageOf = <S extends z.ZodTypeAny>(schema: S) =>
  z.object({
    items: z.array(schema),
    nextCursor: z.string().nullable(),
  });
