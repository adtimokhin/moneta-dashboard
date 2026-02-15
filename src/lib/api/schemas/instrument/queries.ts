export const instrumentsKeys = {
  all: ["instruments"] as const,
  list: (filters: object = {}, include?: string) =>
    ["instruments", "list", filters, include] as const,
  detail: (id: string | number, include?: string) =>
    ["instruments", "detail", String(id), include] as const,
};
