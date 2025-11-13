type Id = string | number;

const qp = (obj?: Record<string, unknown>) => {
  if (!obj) return "";
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    params.append(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
};

export const EP = {
  // auth
  login: () => `/v1/auth/login`,
  refresh: () => `/v1/auth/refresh`,
  logout: () => `/v1/auth/logout`,

  // companies
  companies: (params?: { cursor?: string; q?: string }) =>
    `/companies${qp(params)}`,
  company: (id: Id) => `/companies/${id}`,

  // receivables
  receivables: (params?: {
    cursor?: string;
    status?: string;
    companyId?: Id;
  }) => `/receivables${qp(params)}`,
  receivable: (id: Id) => `/receivables/${id}`,

  // payouts
  payouts: (params?: { companyId?: Id; cursor?: string }) =>
    `/payouts${qp(params)}`,
  payout: (id: Id) => `/payouts/${id}`,
};
