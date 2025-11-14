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

  // users
  users: (params?: {
    cursor?: string;
    q?: string;
    role?: string;
    companyId?: Id;
  }) => `/v1/users${qp(params)}`,
  user: (id: Id) => `/v1/users/${id}`,
  me: () => `/v1/users/me`,

  // companies
  companies: (params?: { cursor?: string; q?: string }) =>
    `/v1/companies${qp(params)}`,
  company: (id: Id) => `/v1/companies/${id}`,

  // company addresses
  companyAddresses: () => `/v1/company-addresses`,
  companyAddress: (id: Id) => `/v1/company-addresses/${id}`, // (detail not yet implemented server-side, reserved)

  // receivables
  receivables: (params?: {
    cursor?: string;
    status?: string;
    companyId?: Id;
  }) => `/v1/receivables${qp(params)}`,
  receivable: (id: Id) => `/v1/receivables/${id}`,

  // payouts
  payouts: (params?: { companyId?: Id; cursor?: string }) =>
    `/v1/payouts${qp(params)}`,
  payout: (id: Id) => `/v1/payouts/${id}`,
};
