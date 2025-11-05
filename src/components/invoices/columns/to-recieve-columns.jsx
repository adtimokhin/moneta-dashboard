"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const columns = [
  // Selection checkbox column
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // Company (sortable)
  {
    accessorKey: "company",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Company
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("company") ?? "—"}</div>
    ),
  },

  // Payment ID
  {
    accessorKey: "paymentId",
    header: "Payment ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue("paymentId") ?? "—"}
      </div>
    ),
  },

  // Status (sortable with visual indicator)
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      const statusColors = {
        paid: "bg-green-100 text-green-800",
        failure: "bg-red-100 text-red-800",
        waiting: "bg-yellow-100 text-yellow-800",
        _default: "bg-gray-100 text-gray-800",
      };
      const cls = statusColors[status] ?? statusColors._default;
      const label =
        typeof status === "string"
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "—";
      return (
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
        >
          {label}
        </div>
      );
    },
  },

  // Payment Due / Arrive By (same key as to-pay: paymentDue)
  {
    accessorKey: "paymentDue", // <-- matches to-pay data shape
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Payment Arrive By
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    // Optional: better date sorting
    sortingFn: (a, b, id) =>
      new Date(a.getValue(id) ?? 0) - new Date(b.getValue(id) ?? 0),
    cell: ({ row }) => {
      const raw = row.getValue("paymentDue");
      if (!raw) return <div className="text-muted-foreground">—</div>;
      const d = new Date(raw);
      if (isNaN(d)) return <div className="text-muted-foreground">—</div>;
      const formatted = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div>{formatted}</div>;
    },
  },

  // Payment Amount (sortable, right-aligned)
  {
    accessorKey: "paymentAmount",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    // Optional: numeric sorting if amounts are numbers/strings
    sortingFn: (a, b, id) =>
      parseFloat(a.getValue(id) ?? 0) - parseFloat(b.getValue(id) ?? 0),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("paymentAmount") ?? 0);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number.isFinite(amount) ? amount : 0);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },

];
