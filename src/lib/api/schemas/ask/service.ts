import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas";
import { Ask, AskFilters } from "./schemas";
import { EP } from "../../endpoints";

const zAsks = arrayOf(Ask);

/** POST /v1/ask/search → Ask[] */
export async function searchAsks(
  filters: AskFilters,
  include?: string
): Promise<z.infer<typeof zAsks>> {
  const params = include ? { include } : {};
  const { data } = await api.post(EP.v1.askSearch(), filters, {
    headers: { "Content-Type": "application/json" },
    params,
  });
  return zAsks.parse(data);
}

/** GET /v1/ask/{id} → Ask */
export async function getAsk(id: string, include?: string): Promise<Ask> {
  const params = include ? { include } : {};
  const { data } = await api.get(EP.v1.askGetById(id), { params });
  return Ask.parse(data);
}
