"use client";

import { useCompanyAddresses } from "@/lib/api/schemas/company-address";

export default function CompanyAddressesList() {
  const { data, isLoading, isError } = useCompanyAddresses();
  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div>Failed to load</div>;
  if (!data?.length) return <div>No addresses yet.</div>;

  return (
    <ul className="space-y-2">
      {data.map((a) => (
        <li key={a.id} className="rounded border p-2">
          <div className="font-medium">
            {a.type} — {a.street}, {a.city}
            {a.state ? `, ${a.state}` : ""}, {a.country} {a.postalCode}
          </div>
          <div className="text-xs opacity-70">companyId: {a.companyId}</div>
        </li>
      ))}
    </ul>
  );
}
