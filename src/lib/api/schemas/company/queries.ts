import { buildKeys } from "@/lib/api/utils";

const baseKeys = buildKeys("companies");

export const companiesKeys = {
  ...baseKeys,
  detail: (
    id: string | number,
    include?: Array<"addresses" | "instruments" | "users">
  ) => {
    if (include && include.length > 0) {
      return ["companies", "detail", String(id), { include }] as const;
    }
    return ["companies", "detail", String(id)] as const;
  },
};
