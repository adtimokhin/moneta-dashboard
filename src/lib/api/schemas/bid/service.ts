import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas";
import { Bid, BidFilters } from "./schemas";
import { EP } from "../../endpoints";

const zBids = arrayOf(Bid);

/** POST /v1/bid/search → Bid[] */
export async function searchBids(
  filters: BidFilters,
  include?: string
): Promise<z.infer<typeof zBids>> {
  const params = include ? { include } : {};
  const { data } = await api.post(EP.v1.bidSearch(), filters, {
    headers: { "Content-Type": "application/json" },
    params,
  });
  return zBids.parse(data);
}

/** GET /v1/bid/{id} → Bid */
export async function getBid(id: string, include?: string): Promise<Bid> {
  const params = include ? { include } : {};
  const { data } = await api.get(EP.v1.bidGetById(id), { params });
  return Bid.parse(data);
}
