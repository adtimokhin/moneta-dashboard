import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas";
import { CompanyAddress, CompanyAddressCreate } from "./schemas";

/** GET /v1/company-addresses → CompanyAddress[] */
export async function listCompanyAddresses(): Promise<
  z.infer<typeof zAddresses>
> {
  const { data } = await api.get("/v1/company-address");
  return zAddresses.parse(data);
}
const zAddresses = arrayOf(CompanyAddress);

/** POST /v1/company-addresses → CompanyAddress */
export async function createCompanyAddress(
  payload: CompanyAddressCreate
): Promise<CompanyAddress> {
  const { data } = await api.post("/v1/company-address", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return CompanyAddress.parse(data);
}
