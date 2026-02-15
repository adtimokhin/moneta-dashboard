import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas";
import {
  Company,
  CompanyCreate,
  CompanyFilters,
  IncludeOption,
} from "./schemas";
import { EP } from "../../endpoints";

const zCompanies = arrayOf(Company);

/** GET /v1/company → Company[] */
export async function listCompanies(): Promise<z.infer<typeof zCompanies>> {
  const { data } = await api.get(EP.v1.companyGetAll());
  return zCompanies.parse(data);
}

/** POST /v1/company/search → Company[] */
export async function searchCompanies(
  filters: CompanyFilters,
  include?: Array<IncludeOption>
): Promise<z.infer<typeof zCompanies>> {
  const params =
    include && include.length > 0 ? { include: include.join(",") } : undefined;

  const { data } = await api.post(EP.v1.companySearch(), filters, {
    headers: { "Content-Type": "application/json" },
    params
  });

  const parsed = zCompanies.parse(data);
  return parsed;
}

/** GET /v1/company/{companyId} → Company | null */
export async function getCompanyById(
  companyId: string,
  include?: Array<IncludeOption>
): Promise<Company | null> {
  const params =
    include && include.length > 0 ? { include: include.join(",") } : undefined;

  const { data } = await api.get(EP.v1.companyGetById(companyId), { params });
  if (data == null) {
    return null;
  }
  return Company.parse(data);
}

/** POST /v1/company → Company */
export async function createCompany(payload: CompanyCreate): Promise<Company> {
  const { data } = await api.post(EP.v1.companyCreate(), payload, {
    headers: { "Content-Type": "application/json" },
  });
  return Company.parse(data);
}
