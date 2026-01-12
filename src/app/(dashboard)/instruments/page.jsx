"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Plus, Send } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useSearchInstruments, useTransitionInstrument } from "@/lib/api/schemas/instrument";
import { useMeStore } from "@/lib/persist/auth/meStore";
import { toast } from "sonner";

// Utilities
const fmtMoney = (amt, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amt);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getInstrumentStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500";
    case "DRAFT":
      return "bg-yellow-500";
    case "PENDING_APPROVAL":
      return "bg-orange-500";
    case "SUSPENDED":
      return "bg-red-500";
    case "REJECTED":
      return "bg-red-600";
    case "MATURED":
      return "bg-blue-500";
    default:
      return "bg-gray-300";
  }
};

const getMaturityStatusColor = (status) => {
  switch (status) {
    case "NOT_MATURED":
      return "bg-green-500";
    case "MATURED":
      return "bg-blue-500";
    case "DEFAULTED":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};

const getTradingStatusColor = (status) => {
  switch (status) {
    case "LISTED":
      return "bg-green-500";
    case "NOT_LISTED":
      return "bg-gray-400";
    case "SUSPENDED":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};

export default function InstrumentsPage() {
  const { me } = useMeStore();
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [submittingId, setSubmittingId] = React.useState(null);

  // Permission checks
  const canCreateInstrument = me?.role === "ADMIN" || me?.role === "ISSUER";
  const canSubmitForApproval = me?.role === "ADMIN" || me?.role === "ISSUER";

  // Fetch instruments issued by the company
  const {
    data: instrumentsData,
    isLoading,
    error,
  } = useSearchInstruments({
    issuerId: me?.companyId ? [me.companyId] : undefined,
    ...(statusFilter !== "ALL" && { instrumentStatus: statusFilter }),
    limit: 200,
    sort: "-createdAt",
  });

  // Transition mutation
  const transitionMutation = useTransitionInstrument();

  const handleSubmitForApproval = (instrumentId) => {
    if (transitionMutation.isPending) return;
    setSubmittingId(instrumentId);

    transitionMutation.mutate(
      {
        id: instrumentId,
        body: { newStatus: "PENDING_APPROVAL" },
      },
      {
        onSuccess: () => {
          toast.success("Instrument submitted for approval!");
          setSubmittingId(null);
        },
        onError: (error) => {
          console.error("Failed to submit for approval:", error);
          toast.error(error?.message || "Failed to submit for approval");
          setSubmittingId(null);
        },
      }
    );
  };

  // Statistics
  const stats = React.useMemo(() => {
    if (!instrumentsData)
      return { total: 0, active: 0, draft: 0, matured: 0, listed: 0 };

    return {
      total: instrumentsData.length,
      active: instrumentsData.filter((i) => i.instrumentStatus === "ACTIVE")
        .length,
      draft: instrumentsData.filter((i) => i.instrumentStatus === "DRAFT")
        .length,
      matured: instrumentsData.filter((i) => i.maturityStatus === "MATURED")
        .length,
      listed: instrumentsData.filter((i) => i.tradingStatus === "LISTED")
        .length,
    };
  }, [instrumentsData]);

  if (!me?.companyId) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">
          Please log in to view your instruments.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-red-600">
          Error loading instruments: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instruments</h1>
          <p className="text-muted-foreground">
            View and manage your company&apos;s instruments
          </p>
        </div>
        {canCreateInstrument && (
          <Button asChild>
            <Link href="/instruments/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Instrument
            </Link>
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Draft</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Matured</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.matured}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Listed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{stats.listed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Instruments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Instruments</CardTitle>
              <CardDescription>
                Instruments issued by your company
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="MATURED">Matured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">
              Loading instruments...
            </p>
          ) : instrumentsData && instrumentsData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Face Value</TableHead>
                  <TableHead>Maturity Date</TableHead>
                  <TableHead>Maturity Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Maturity</TableHead>
                  <TableHead>Trading</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instrumentsData.map((instrument) => (
                  <TableRow key={instrument.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{instrument.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {instrument.id.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {fmtMoney(instrument.faceValue, instrument.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtDate(instrument.maturityDate)}
                    </TableCell>
                    <TableCell>
                      {fmtMoney(instrument.maturityPayment, instrument.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getInstrumentStatusColor(
                          instrument.instrumentStatus
                        )}
                      >
                        {instrument.instrumentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getMaturityStatusColor(
                          instrument.maturityStatus
                        )}
                      >
                        {instrument.maturityStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getTradingStatusColor(
                          instrument.tradingStatus
                        )}
                      >
                        {instrument.tradingStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/instruments/${instrument.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        {instrument.instrumentStatus === "DRAFT" && canSubmitForApproval && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmitForApproval(instrument.id)}
                            disabled={submittingId === instrument.id}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            {submittingId === instrument.id ? "Submitting..." : "Submit"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No instruments found for your company.
              </p>
              {canCreateInstrument && (
                <Button asChild>
                  <Link href="/instruments/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Instrument
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
