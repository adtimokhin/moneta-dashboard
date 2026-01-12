"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  DollarSign,
  Info,
  Clock,
  Send,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useInstrument, useTransitionInstrument } from "@/lib/api/schemas/instrument";
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

const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtFileSize = (bytes) => {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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

export default function InstrumentDetailPage() {
  const params = useParams();
  const instrumentId = params.instrumentId;
  const { me } = useMeStore();

  // Permission checks
  const canSubmitForApproval = me?.role === "ADMIN" || me?.role === "ISSUER";

  // Fetch the instrument with documents included
  const {
    data: instrument,
    isLoading,
    error,
  } = useInstrument(instrumentId, "instrumentDocuments");

  // Transition mutation
  const transitionMutation = useTransitionInstrument();

  const handleSubmitForApproval = () => {
    if (transitionMutation.isPending) return;

    transitionMutation.mutate(
      {
        id: instrumentId,
        body: { newStatus: "PENDING_APPROVAL" },
      },
      {
        onSuccess: () => {
          toast.success("Instrument submitted for approval!");
        },
        onError: (error) => {
          console.error("Failed to submit for approval:", error);
          toast.error(error?.message || "Failed to submit for approval");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">
          Loading instrument details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-red-600">
          Error loading instrument: {error.message}
        </p>
      </div>
    );
  }

  if (!instrument) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">
          Instrument not found.
        </p>
      </div>
    );
  }

  const documents = instrument.instrumentDocuments || [];
  const publicPayload = instrument.publicPayload || {};
  const hasPublicPayload = Object.keys(publicPayload).length > 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/instruments">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{instrument.name}</h1>
          <p className="text-muted-foreground text-sm">
            ID: {instrument.id}
          </p>
        </div>
        {instrument.instrumentStatus === "DRAFT" && canSubmitForApproval && (
          <Button
            onClick={handleSubmitForApproval}
            disabled={transitionMutation.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            {transitionMutation.isPending ? "Submitting..." : "Submit for Approval"}
          </Button>
        )}
      </div>

      {/* Status Badges */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge className={getInstrumentStatusColor(instrument.instrumentStatus)}>
            {instrument.instrumentStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Maturity:</span>
          <Badge className={getMaturityStatusColor(instrument.maturityStatus)}>
            {instrument.maturityStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trading:</span>
          <Badge className={getTradingStatusColor(instrument.tradingStatus)}>
            {instrument.tradingStatus}
          </Badge>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Core details about this instrument
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Face Value
              </p>
              <p className="text-lg font-semibold">
                {fmtMoney(instrument.faceValue, instrument.currency)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Maturity Payment
              </p>
              <p className="text-lg font-semibold">
                {fmtMoney(instrument.maturityPayment, instrument.currency)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="text-lg font-semibold">{instrument.currency}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Maturity Date
              </p>
              <p className="text-lg font-semibold">
                {fmtDate(instrument.maturityDate)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Created At
              </p>
              <p className="text-lg font-semibold">
                {fmtDateTime(instrument.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Issuer ID</p>
              <p className="text-sm font-mono">
                {instrument.issuerId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Linked Documents
          </CardTitle>
          <CardDescription>
            Documents associated with this instrument
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Linked At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const document = doc.document;
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {document?.name || "Unknown Document"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {document?.mimeType || "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtFileSize(document?.size)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDateTime(doc.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {document?.url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={document.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No URL
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No documents linked to this instrument.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Public Payload */}
      <Card>
        <CardHeader>
          <CardTitle>Public Payload</CardTitle>
          <CardDescription>
            Custom public metadata associated with this instrument
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPublicPayload ? (
            <div className="space-y-3">
              {Object.entries(publicPayload).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start gap-4 py-2 border-b last:border-b-0"
                >
                  <span className="text-sm font-medium text-muted-foreground min-w-[150px]">
                    {key}
                  </span>
                  <span className="text-sm">
                    {typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No public payload data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>System information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Instrument ID:</span>
              <p className="font-mono">{instrument.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Issuer ID:</span>
              <p className="font-mono">{instrument.issuerId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created By:</span>
              <p className="font-mono">{instrument.createdBy}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created At:</span>
              <p>{fmtDateTime(instrument.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
