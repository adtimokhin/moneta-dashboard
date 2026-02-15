// src/lib/api/utils.ts
export const qp = (obj?: Record<string, unknown>) => {
  if (!obj) return "";
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    p.append(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const buildKeys = (resource: string) => ({
  all: [resource] as const,
  list: (filters: object = {}) => [resource, "list", filters] as const,
  detail: (id: string | number) => [resource, "detail", String(id)] as const,
});
