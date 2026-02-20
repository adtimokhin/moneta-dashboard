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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchListings } from "@/lib/api/schemas/listing";
import { useSearchCompanies } from "@/lib/api/schemas/company";
import { useMeStore } from "@/lib/persist/auth/meStore";

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
  const [statusFilter, setStatusFilter] = React.useState("OPEN");
  const [showClosedListings, setShowClosedListings] = React.useState(false);

  // Get current user from persistence
  const { me } = useMeStore();
  const userCompanyId = me?.companyId;

  // Fetch listings with instruments from the API
  const { data: listingsData, isLoading: isLoadingListings, error: listingsError } = useSearchListings(
    {
      ...(statusFilter !== "ALL" && { status: statusFilter }),
      limit: 200, // Get all for client-side filtering/sorting
      offset: 0,
    },
    "instrument" // Include the instrument details
  );

  // Fetch all companies for name resolution
  const { data: companiesData, isLoading: isLoadingCompanies } = useSearchCompanies({
    limit: 200,
  });

  // Create a company lookup map
  const companyMap = React.useMemo(() => {
    if (!companiesData) return new Map();
    return new Map(companiesData.map((company) => [company.id, company]));
  }, [companiesData]);

  // Extract data, handling the case where instrument might not be populated
  const data = React.useMemo(() => {
    if (!listingsData) return [];

    let filteredListings = listingsData.filter((listing) => listing.instrument);

    // Apply closed listing filter
    if (!showClosedListings) {
      filteredListings = filteredListings.filter((listing) => listing.status !== "CLOSED");
    }

    return filteredListings.map((listing) => {
      const instrument = listing.instrument;
      const sellerCompany = companyMap.get(listing.sellerCompanyId);
      const isOwnedByUser = listing.sellerCompanyId === userCompanyId;

      return {
        id: instrument.id,
        listingId: listing.id,
        name: instrument.name,
        seller: sellerCompany?.legalName || sellerCompany?.tradeName || listing.sellerCompanyId,
        sellerCompanyId: listing.sellerCompanyId,
        currency: instrument.currency,
        amount: instrument.faceValue,
        issuedAt: instrument.createdAt,
        dueAt: instrument.maturityDate,
        maturityPayment: instrument.maturityPayment,
        instrumentStatus: instrument.instrumentStatus,
        tradingStatus: instrument.tradingStatus,
        listingStatus: listing.status,
        sold: listing.status === "CLOSED",
        isOwnedByUser,
      };
    });
  }, [listingsData, companyMap, userCompanyId, showClosedListings]);

  // Filter (search across a few columns)
  const q = query.trim().toLowerCase();
  const filtered = data.filter((r) => {
    if (!q) return true;
    const hay = [
      r.id,
      r.name,
      r.seller,
      r.currency,
      r.listingStatus,
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
      case "maturityPayment":
        comparator = compareBy("maturityPayment", Number);
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
      case "name":
        comparator = compareBy("name");
        break;
      case "seller":
        comparator = compareBy("seller");
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

  const isLoading = isLoadingListings || isLoadingCompanies;
  const error = listingsError;

  // Show loading and error states
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">Loading receivables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex items-center justify-center py-10">
          <p className="text-red-600">
            Error loading receivables: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Tradable Receivables</h1>
          <p className="text-sm text-muted-foreground">
            Live notes available for secondary purchase on the platform.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Listings</SelectItem>
              <SelectItem value="OPEN">Open Only</SelectItem>
              <SelectItem value="CLOSED">Closed Only</SelectItem>
              <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showClosedListings}
              onChange={(e) => {
                setShowClosedListings(e.target.checked);
                setPage(1);
              }}
              className="rounded"
            />
            Show closed
          </label>

          <Input
            placeholder="Search by name, seller, currency…"
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
              <TableHead className="w-[200px]">
                <SortLabel columnKey="name">Instrument Name</SortLabel>
              </TableHead>
              <TableHead>
                <SortLabel columnKey="seller">Seller</SortLabel>
              </TableHead>
              <TableHead className="text-right">
                <SortLabel columnKey="amount">Face Value</SortLabel>
              </TableHead>
              <TableHead className="text-right">
                <SortLabel columnKey="maturityPayment">Maturity Payment</SortLabel>
              </TableHead>
              <TableHead>
                <SortLabel columnKey="issuedAt">Created</SortLabel>
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
                <TableRow key={r.listingId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{r.name}</span>
                      {r.isOwnedByUser && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Your Company
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <Link
                      href={`/companies/${encodeURIComponent(r.sellerCompanyId)}`}
                      className="text-blue-600 hover:underline"
                    >
                      {r.seller}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {fmtMoney(r.amount, r.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {fmtMoney(r.maturityPayment, r.currency)}
                  </TableCell>
                  <TableCell>{fmtDate(r.issuedAt)}</TableCell>
                  <TableCell>
                    <span className={isPastDue ? "text-red-600" : ""}>
                      {daysText}
                    </span>
                  </TableCell>
                  <TableCell>
                    {r.listingStatus === "CLOSED" ? (
                      <Badge variant="secondary">Closed</Badge>
                    ) : r.listingStatus === "WITHDRAWN" ? (
                      <Badge variant="outline">Withdrawn</Badge>
                    ) : r.listingStatus === "SUSPENDED" ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge variant="default">Open</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.listingStatus !== "OPEN" || r.isOwnedByUser ? (
                      <Button size="sm" variant="outline" disabled>
                        {r.isOwnedByUser ? "Your Listing" : "Purchase"}
                      </Button>
                    ) : (
                      <Button size="sm" asChild>
                        <Link
                          href={`/listings/${encodeURIComponent(r.listingId)}/bid`}
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
                  {data.length === 0
                    ? "No receivables available at the moment."
                    : "No receivables match your search."}
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
