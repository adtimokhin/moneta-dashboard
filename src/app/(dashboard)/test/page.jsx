"use client";

import { useUserFiltersStore } from "@/lib/persist/user-filters/store";

export default function UserFiltersPanel() {
  const { filters, updateFilters, clearFilters } = useUserFiltersStore();

  const current = filters || {};

  const handleChange = (field, value) => {
    // Convert empty string → undefined so backend ignores it
    const v = value === "" ? undefined : value;
    updateFilters({ [field]: v });
  };

  const handleNumberChange = (field, value) => {
    const trimmed = value.trim();
    const v = trimmed === "" ? undefined : Number(trimmed);
    updateFilters({ [field]: v });
  };

  return (
    <div className="space-y-4 rounded border p-4 text-sm">
      <h2 className="text-base font-semibold">User Filters (Persisted)</h2>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Email */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">Email (partial)</label>
          <input
            type="text"
            value={current.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
            placeholder="e.g. alex@"
          />
        </div>

        {/* First name */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">First name</label>
          <input
            type="text"
            value={current.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
          />
        </div>

        {/* Last name */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">Last name</label>
          <input
            type="text"
            value={current.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
          />
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">Role</label>
          <input
            type="text"
            value={current.role || ""}
            onChange={(e) => handleChange("role", e.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
            placeholder="e.g. ADMIN, BUYER…"
          />
        </div>

        {/* Company ID */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">Company ID</label>
          <input
            type="text"
            value={current.companyId || ""}
            onChange={(e) => handleChange("companyId", e.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
          />
        </div>

        {/* Limit */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">Limit</label>
          <input
            type="number"
            value={current.limit ?? ""}
            onChange={(e) => handleNumberChange("limit", e.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
            placeholder="e.g. 50"
          />
        </div>

        {/* Offset */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">Offset</label>
          <input
            type="number"
            value={current.offset ?? ""}
            onChange={(e) => handleNumberChange("offset", e.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
            placeholder="e.g. 0"
          />
        </div>

        {/* Sort */}
        <div className="space-y-1">
          <label className="block text-xs font-medium">Sort</label>
          <input
            type="text"
            value={current.sort || ""}
            onChange={(e) => handleChange("sort", e.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
            placeholder='e.g. "-created_at,first_name"'
          />
        </div>
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="rounded border px-3 py-1 text-xs font-medium"
      >
        Clear filters
      </button>

      <div className="mt-3 rounded bg-black/5 p-2 text-[10px]">
        <div className="mb-1 font-semibold">Current persisted filters</div>
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>
    </div>
  );
}
