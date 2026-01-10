import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas";
import { Listing, ListingFilters } from "./schemas";
import { EP } from "../../endpoints";

const zListings = arrayOf(Listing);

/** POST /v1/listing/search → Listing[] */
export async function searchListings(
  filters: ListingFilters,
  include?: string
): Promise<z.infer<typeof zListings>> {
  const params = include ? { include } : {};
  const { data } = await api.post(EP.v1.listingSearch(), filters, {
    headers: { "Content-Type": "application/json" },
    params,
  });
  return zListings.parse(data);
}

/** GET /v1/listing/{id} → Listing */
export async function getListing(
  id: string,
  include?: string
): Promise<Listing> {
  const params = include ? { include } : {};
  const { data } = await api.get(EP.v1.listingGetById(id), { params });
  return Listing.parse(data);
}
