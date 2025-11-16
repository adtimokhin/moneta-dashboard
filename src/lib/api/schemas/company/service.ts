import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas"
import { Company, CompanyCreate, CompanyFilters } from "./schemas";

/** GET /v1/company → Company[] */
export async function listCompanies(): Promise<z.infer<typeof zCompanies>> {
  const { data } = await api.get("/v1/company");
  return zCompanies.parse(data);
}
const zCompanies = arrayOf(Company);

/** POST /v1/company/search → Company[] */
export async function searchCompanies(
  filters: CompanyFilters
): Promise<z.infer<typeof zCompanies>> {
  const { data } = await api.post("/v1/company/search", filters, {
    headers: { "Content-Type": "application/json" },
  });
  return zCompanies.parse(data);
}

/** GET /v1/company/{companyId} → Company | null */
export async function getCompanyById(
  companyId: string
): Promise<Company | null> {
  const { data } = await api.get(`/v1/company/${companyId}`);
  if (data == null) {
    return null;
  }
  return Company.parse(data);
}

/** POST /v1/company → Company */
export async function createCompany(payload: CompanyCreate): Promise<Company> {
  const { data } = await api.post("/v1/company", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return Company.parse(data);
}
