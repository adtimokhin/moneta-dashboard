import { z } from "zod";

////////////////////////////////////////////////////////////////////////////////
//                            Shared Entities
////////////////////////////////////////////////////////////////////////////////
/** Moneta UUID (server sends camelCase) */
export const MonetaID = z.string().uuid();

/** Base fields every DTO inherits (from BaseDTO on backend) */
export const BaseDTO = z.object({
  id: MonetaID,
  createdAt: z.string(), // keep as string; switch to z.coerce.date() if you prefer Date
});

////////////////////////////////////////////////////////////////////////////////
//                                 Enums
////////////////////////////////////////////////////////////////////////////////
export const UserRole = z.enum(["ADMIN", "BUYER", "SELLER", "ISSUER"]);
export const AddressType = z.enum([
  "REGISTERED",
  "BILLING",
  "OFFICE",
  "SHIPPING",
  "OTHER",
]);
export const InstrumentStatus = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "ACTIVE",
  "MATURED",
  "REJECTED",
  "SUSPENDED",
]);
export const MaturityStatus = z.enum([
  "NOT_DUE",
  "DUE",
  "IN_GRACE",
  "PARTIALLY_PAID",
  "PAID",
  "LATE",
  "DEFAULTED",
  "DISPUTED",
]);
export const TradingStatus = z.enum([
  "OFF_MARKET",
  "DRAFT",
  "LISTED",
  "PAUSED",
  "UNDER_OFFER",
  "RESERVED",
  "ESCROW",
  "SETTLEMENT_PENDING",
  "CANCELLED",
  "EXPIRED",
  "SUSPENDED",
  "FAILED_SETTLEMENT",
]);
export type AddressType = z.infer<typeof AddressType>;
export type UserRole = z.infer<typeof UserRole>;
export type InstrumentStatus = z.infer<typeof InstrumentStatus>;
export type MaturityStatus = z.infer<typeof MaturityStatus>;
export type TradingStatus = z.infer<typeof TradingStatus>;

////////////////////////////////////////////////////////////////////////////////
//                                  Helpers
////////////////////////////////////////////////////////////////////////////////
export const arrayOf = <S extends z.ZodTypeAny>(schema: S) => z.array(schema);
export const pageOf = <S extends z.ZodTypeAny>(schema: S) =>
  z.object({
    items: z.array(schema),
    nextCursor: z.string().nullable(),
  });
