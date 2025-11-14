import { buildKeys } from "@/lib/api/utils";

export const companiesKeys = buildKeys("companies");
// -> companiesKeys.all, companiesKeys.list({}), companiesKeys.detail(id)  (detail reserved for future)
