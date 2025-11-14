import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas"
import { Company, CompanyCreate } from "./schemas";

/** GET /v1/companies → Company[] */
export async function listCompanies(): Promise<z.infer<typeof zCompanies>> {
  const { data } = await api.get("/v1/company");
  return zCompanies.parse(data);
}
const zCompanies = arrayOf(Company);

/** POST /v1/companies → Company */
export async function createCompany(payload: CompanyCreate): Promise<Company> {
  const { data } = await api.post("/v1/company", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return Company.parse(data);
}
