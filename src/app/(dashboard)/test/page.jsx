"use client";

import { useEffect } from "react";
import { useMe } from "@/lib/api/schemas/user/hooks";
import { useMeStore } from "@/lib/persist/auth/meStore";
import { useAuthStore } from "@/lib/persist/auth/store";

export default function MePersistenceTester() {
  const { data, isLoading, isError, refetch } = useMe();
  const { me } = useMeStore();
  const { accessToken, accessExp } = useAuthStore();

  // Just for console debugging if you want
  useEffect(() => {
    if (me) {
      // eslint-disable-next-line no-console
      console.log("Persisted /me from store:", me);
    }
  }, [me]);

  return (
    <div className="space-y-4 rounded border p-4 text-sm">
      <h2 className="text-base font-semibold">/me Persistence Tester</h2>

      {/* Auth info */}
      <section className="space-y-1 rounded border p-2">
        <div className="text-xs font-medium">Auth store</div>
        <div className="text-[11px]">
          <div>
            <span className="font-semibold">accessToken:</span>{" "}
            <code>{accessToken || "(null)"}</code>
          </div>
          <div>
            <span className="font-semibold">accessExp:</span>{" "}
            <code>{accessExp != null ? accessExp : "(null)"}</code>
          </div>
        </div>
      </section>

      {/* Query controls */}
      <section className="space-y-2 rounded border p-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded border px-3 py-1 text-xs font-medium"
          >
            Refetch /me
          </button>
          {isLoading && (
            <span className="text-xs text-blue-600">Loading /me…</span>
          )}
          {isError && (
            <span className="text-xs text-red-600">Error loading /me</span>
          )}
        </div>

        <div className="text-[11px]">
          <div className="font-semibold mb-1">Latest /me from React Query</div>
          <pre className="max-h-40 overflow-auto rounded bg-black/5 p-2">
            {data ? JSON.stringify(data, null, 2) : "(no data yet)"}
          </pre>
        </div>
      </section>

      {/* Persisted /me */}
      <section className="space-y-2 rounded border p-2">
        <div className="text-xs font-medium">Persisted /me from meStore</div>
        <div className="text-[11px]">
          <pre className="max-h-40 overflow-auto rounded bg-black/5 p-2">
            {me ? JSON.stringify(me, null, 2) : "(me is null in store)"}
          </pre>
        </div>
      </section>

      <p className="text-[11px] opacity-70">
        Tip: refresh the page after fetching <code>/me</code> to confirm the
        persisted value still shows up under “Persisted /me from meStore”.
      </p>
    </div>
  );
}