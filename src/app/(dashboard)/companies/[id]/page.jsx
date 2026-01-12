"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCompany } from "@/lib/api/schemas/company/hooks";
import { Skeleton } from "@/components/ui/skeleton";

const fmtMoney = (amt, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amt);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

const AddressTypeMap = {
  REGISTERED: "Registered HQ",
  BILLING: "Billing",
  OFFICE: "Office",
  SHIPPING: "Shipping",
  OTHER: "Other",
};

const InstrumentStatusBadge = ({ status }) => {
  const variants = {
    DRAFT: "secondary",
    PENDING_APPROVAL: "outline",
    ACTIVE: "default",
    MATURED: "secondary",
    REJECTED: "destructive",
  };
  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
};

const TradingStatusBadge = ({ status }) => {
  const variants = {
    DRAFT: "secondary",
    LISTED: "default",
    PAUSED: "outline",
    OFF_MARKET: "secondary",
  };
  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
};

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // Fetch company with addresses and instruments
  const {
    data: company,
    isLoading,
    error,
  } = useCompany(companyId, ["addresses", "instruments"]);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <h2 className="font-semibold">Error loading company</h2>
          <p className="text-sm mt-1">{error.message || "An error occurred"}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !company) {
    return (
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const addresses = company.addresses || [];
  const instruments = company.instruments || [];

  // Calculate active and inactive instruments
  const activeInstruments = instruments.filter((i) => i.instrumentStatus === "ACTIVE");
  const draftInstruments = instruments.filter((i) => i.instrumentStatus === "DRAFT");

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap ">
        <div className="space-y-1 w-full">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{company.legalName}</h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground text-right space-y-1">
            {company.tradeName && (
              <div>Trade Name: {company.tradeName}</div>
            )}
            <div>Registration: {company.registrationNumber}</div>
            <div>Incorporated: {fmtDate(company.incorporationDate)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {addresses.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Instruments</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {activeInstruments.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Draft Instruments</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {draftInstruments.length}
          </CardContent>
        </Card>
      </div>

      {addresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Legal Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.map((addr, i) => (
              <div key={addr.id} className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <div className="md:col-span-2 font-medium">
                  {AddressTypeMap[addr.type] || addr.type}
                </div>
                <div className="md:col-span-4 text-sm">
                  <div>{addr.street}</div>
                  <div className="text-muted-foreground">
                    {[addr.city, addr.state, addr.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  <div className="text-muted-foreground">{addr.country}</div>
                </div>
                {i < addresses.length - 1 ? (
                  <div className="md:col-span-6">
                    <Separator />
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instruments">Instruments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Instruments
                </div>
                <div className="text-xl font-semibold">
                  {instruments.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Active Instruments
                </div>
                <div className="text-xl font-semibold">
                  {activeInstruments.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Registered Addresses
                </div>
                <div className="text-xl font-semibold">
                  {addresses.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instruments" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Instruments</CardTitle>
            </CardHeader>
            <CardContent className="rounded-xl border overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="text-right">Face Value</TableHead>
                    <TableHead className="text-right">Maturity Payment</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead>Instrument Status</TableHead>
                    <TableHead>Trading Status</TableHead>
                    <TableHead className="text-right w-[120px]">
                      View
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instruments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No instruments found for this company.
                      </TableCell>
                    </TableRow>
                  ) : (
                    instruments.map((inst) => (
                      <TableRow key={inst.id}>
                        <TableCell className="font-medium">{inst.name}</TableCell>
                        <TableCell className="text-right">
                          {fmtMoney(inst.faceValue, inst.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmtMoney(inst.maturityPayment, inst.currency)}
                        </TableCell>
                        <TableCell>{fmtDate(inst.maturityDate)}</TableCell>
                        <TableCell>
                          <InstrumentStatusBadge status={inst.instrumentStatus} />
                        </TableCell>
                        <TableCell>
                          <TradingStatusBadge status={inst.tradingStatus} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/instruments/${encodeURIComponent(inst.id)}`}
                            >
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
