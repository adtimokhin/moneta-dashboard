"use client";

import { useSearchCompanies } from "@/lib/api/schemas/company"; // adjust path if needed

export default function CompanySearchList() {
  // This will hit /v1/company/search with empty filters (default page)
  const { data, isLoading, isError } = useSearchCompanies({});

  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div>Failed to load</div>;
  if (!data?.length) return <div>No companies found.</div>;

  return (
    <ul className="space-y-2">
      {data.map((c) => (
        <li key={c.id} className="rounded border p-2">
          <div className="font-medium">
            {c.legalName}
            {c.tradeName ? ` — ${c.tradeName}` : ""}
          </div>
          <div className="text-xs opacity-80">
            Registration: {c.registrationNumber}
          </div>
          <div className="text-[10px] opacity-60">
            id: {c.id} · incorporated: {c.incorporationDate} · createdAt:{" "}
            {c.createdAt}
          </div>
        </li>
      ))}
    </ul>
  );
}
