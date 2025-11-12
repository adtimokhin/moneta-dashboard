"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---- Demo data (replace with your API data) ----
const DEMO_RECEIVABLES = [
  {
    id: "INV-24001",
    seller: "OceanLink Bunkering",
    buyer: "Poseidon Shipping Ltd.",
    currency: "USD",
    amount: 125000,
    issuedAt: "2025-10-21",
    dueAt: "2026-01-15",
    sold: false,
  },
  {
    id: "INV-24002",
    seller: "HarborFuel Traders",
    buyer: "Baltic Carriers",
    currency: "EUR",
    amount: 82000,
    issuedAt: "2025-09-28",
    dueAt: "2025-12-05",
    sold: true,
  },
  {
    id: "INV-24003",
    seller: "BlueWharf Supply",
    buyer: "Caspian Marine",
    currency: "USD",
    amount: 54000,
    issuedAt: "2025-11-01",
    dueAt: "2026-02-01",
    sold: false,
  },
  {
    id: "INV-24004",
    seller: "StraitFuel DMCC",
    buyer: "Lighthouse Tankers",
    currency: "USD",
    amount: 199500,
    issuedAt: "2025-10-11",
    dueAt: "2025-11-25",
    sold: true,
  },
];

// ---- Utilities ----
const fmtMoney = (amt, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amt);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

function daysUntil(iso) {
  const now = new Date();
  const due = new Date(iso);
  const ms = due - now;
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return days;
}

function timeUntilPayoutText(dueAt) {
  const d = daysUntil(dueAt);
  if (d > 1) return `${d} days`;
  if (d === 1) return "1 day";
  if (d === 0) return "today";
  return `past due by ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"}`;
}

// Simple comparator builders
const compareBy =
  (key, coerceFn = (v) => v) =>
  (a, b) => {
    const va = coerceFn(a[key]);
    const vb = coerceFn(b[key]);
    if (va < vb) return -1;
    if (va > vb) return 1;
    return 0;
  };

// ---- Page ----
export default function ReceivablesPage() {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sort, setSort] = React.useState({ key: "dueAt", dir: "asc" });

  // In real app, fetch from API here.
  const data = DEMO_RECEIVABLES;

  // Filter (search across a few columns)
  const q = query.trim().toLowerCase();
  const filtered = data.filter((r) => {
    if (!q) return true;
    const hay = [
      r.id,
      r.seller,
      r.buyer,
      r.currency,
      r.sold ? "sold" : "available",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  // Sort
  const sorted = React.useMemo(() => {
    let comparator;
    switch (sort.key) {
      case "amount":
        comparator = compareBy("amount", Number);
        break;
      case "issuedAt":
        comparator = compareBy("issuedAt", (v) => new Date(v).getTime());
        break;
      case "dueAt":
        comparator = compareBy("dueAt", (v) => new Date(v).getTime());
        break;
      case "sold":
        comparator = compareBy("sold", (v) => (v ? 1 : 0));
        break;
      default:
        comparator = compareBy("id");
    }
    const arr = [...filtered].sort(comparator);
    return sort.dir === "asc" ? arr : arr.reverse();
  }, [filtered, sort]);

  // Pagination
  const total = sorted.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, lastPage);
  const startIdx = (currentPage - 1) * pageSize;
  const paged = sorted.slice(startIdx, startIdx + pageSize);

  function toggleSort(key) {
    setPage(1);
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  const SortLabel = ({ columnKey, children }) => (
    <button
      type="button"
      onClick={() => toggleSort(columnKey)}
      className="flex items-center gap-1"
      title="Sort"
    >
      <span>{children}</span>
      <span className="text-xs opacity-60">
        {sort.key === columnKey ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Tradable Receivables</h1>
          <p className="text-sm text-muted-foreground">
            Live notes available for secondary purchase on the platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by ID, seller, buyer, currency, status…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-72"
          />
        </div>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableCaption>
            Showing {paged.length} of {total} result{total === 1 ? "" : "s"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">
                <SortLabel columnKey="id">Note ID</SortLabel>
              </TableHead>
              <TableHead>
                <SortLabel columnKey="seller">Seller</SortLabel>
              </TableHead>
              <TableHead>
                <SortLabel columnKey="buyer">Buyer</SortLabel>
              </TableHead>
              <TableHead className="text-right">
                <SortLabel columnKey="amount">Amount</SortLabel>
              </TableHead>
              <TableHead>
                <SortLabel columnKey="issuedAt">Issued</SortLabel>
              </TableHead>
              <TableHead>
                <SortLabel columnKey="dueAt">Time Until Payout</SortLabel>
              </TableHead>
              <TableHead>
                <SortLabel columnKey="sold">Status</SortLabel>
              </TableHead>
              <TableHead className="w-[140px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paged.map((r) => {
              const daysText = timeUntilPayoutText(r.dueAt);
              const isPastDue = daysUntil(r.dueAt) < 0;
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.seller}</TableCell>
                  <TableCell>{r.buyer}</TableCell>
                  <TableCell className="text-right">
                    {fmtMoney(r.amount, r.currency)}
                  </TableCell>
                  <TableCell>{fmtDate(r.issuedAt)}</TableCell>
                  <TableCell>
                    <span className={isPastDue ? "text-red-600" : ""}>
                      {daysText}
                    </span>
                  </TableCell>
                  <TableCell>
                    {r.sold ? (
                      <Badge variant="secondary">Sold</Badge>
                    ) : (
                      <Badge variant="default">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.sold ? (
                      <Button size="sm" variant="outline" disabled>
                        Purchase
                      </Button>
                    ) : (
                      <Button size="sm" asChild>
                        <Link
                          href={`/receivables/${encodeURIComponent(r.id)}/buy`}
                        >
                          Purchase
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {paged.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-10 text-muted-foreground"
                >
                  No receivables match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Page <strong>{currentPage}</strong> of <strong>{lastPage}</strong>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
          >
            « First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={currentPage === lastPage}
          >
            Next ›
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(lastPage)}
            disabled={currentPage === lastPage}
          >
            Last »
          </Button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-9 rounded-md border bg-background px-2 text-sm"
            aria-label="Rows per page"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
