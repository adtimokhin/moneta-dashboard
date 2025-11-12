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
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const DEMO_COMPANIES = {
  "c-001": {
    id: "c-001",
    name: "OceanLink Bunkering",
    type: "Seller",
    accountsCount: 4,
    addresses: [
      {
        title: "Registered HQ",
        line1: "1200 Bayport Blvd",
        city: "Houston",
        state: "TX",
        postal: "77001",
        country: "United States of America",
      },
      {
        title: "Billing",
        line1: "Pier 9, Warehouse B",
        city: "Galveston",
        state: "TX",
        postal: "77550",
        country: "United States of America",
      },
    ],
    seller: {
      currentReceivables: [
        {
          id: "INV-24021",
          buyer: "Poseidon Shipping Ltd.",
          currency: "USD",
          amount: 145000,
          issuedAt: "2025-10-02",
          dueAt: "2026-01-15",
          status: "Open",
        },
        {
          id: "INV-24028",
          buyer: "Baltic Carriers",
          currency: "USD",
          amount: 82000,
          issuedAt: "2025-11-01",
          dueAt: "2026-02-10",
          status: "Open",
        },
      ],
      pastReceivables: [
        {
          id: "INV-23988",
          buyer: "Caspian Marine",
          currency: "USD",
          amount: 56000,
          issuedAt: "2025-07-02",
          dueAt: "2025-09-30",
          status: "Paid",
        },
        {
          id: "INV-23961",
          buyer: "Lighthouse Tankers",
          currency: "USD",
          amount: 199500,
          issuedAt: "2025-06-12",
          dueAt: "2025-08-15",
          status: "Paid Late",
        },
      ],
      payoutStats: {
        totalPaidUSD: 255500,
        averageDaysToPayout: 43,
        onTimeRate: 0.78,
      },
    },
  },
  "c-002": {
    id: "c-002",
    name: "Poseidon Shipping Ltd.",
    type: "Buyer",
    accountsCount: 3,
    addresses: [
      {
        title: "Head Office",
        line1: "5 Trinity Square",
        city: "London",
        state: "",
        postal: "EC3N 4DJ",
        country: "United Kingdom",
      },
    ],
    buyer: {
      currentPositions: [
        {
          id: "INV-24021",
          seller: "OceanLink Bunkering",
          currency: "USD",
          face: 145000,
          purchasedAt: "2025-11-03",
          dueAt: "2026-01-15",
          status: "Holding",
        },
      ],
      pastPositions: [
        {
          id: "INV-23940",
          seller: "StraitFuel DMCC",
          currency: "USD",
          face: 91000,
          purchasedAt: "2025-07-05",
          dueAt: "2025-09-10",
          status: "Paid",
        },
      ],
    },
  },
};

const fmtMoney = (amt, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amt);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const data = DEMO_COMPANIES[companyId] ?? DEMO_COMPANIES["c-001"];

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
              <h1 className="text-2xl font-semibold">{data.name}</h1>
              <Badge variant={data.type === "Seller" ? "default" : "secondary"}>
                {data.type}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground text-right">
            Company ID: {data.id}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {data.accountsCount}
          </CardContent>
        </Card>

        {data.type === "Seller" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Total Payouts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold">
                  {fmtMoney(data.seller.payoutStats.totalPaidUSD, "USD")}
                </div>
                <div className="text-sm text-muted-foreground">
                  All-time paid to seller
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>On-Time Payout Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-semibold">
                    {Math.round(data.seller.payoutStats.onTimeRate * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {data.seller.payoutStats.averageDaysToPayout} avg days
                  </div>
                </div>
                <Progress
                  value={Math.round(data.seller.payoutStats.onTimeRate * 100)}
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {data.buyer.currentPositions.length}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Settled Positions</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {data.buyer.pastPositions.length}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legal Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.addresses.map((addr, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <div className="md:col-span-2 font-medium">{addr.title}</div>
              <div className="md:col-span-4 text-sm">
                <div>{addr.line1}</div>
                {addr.line2 ? <div>{addr.line2}</div> : null}
                <div className="text-muted-foreground">
                  {[addr.city, addr.state, addr.postal]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                <div className="text-muted-foreground">{addr.country}</div>
              </div>
              {i < data.addresses.length - 1 ? (
                <div className="md:col-span-6">
                  <Separator />
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {data.type === "Seller" ? (
            <TabsTrigger value="receivables">Receivables</TabsTrigger>
          ) : null}
          {data.type === "Buyer" ? (
            <TabsTrigger value="positions">Bought Receivables</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          {data.type === "Seller" ? (
            <Card>
              <CardHeader>
                <CardTitle>Seller Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Open Receivables
                  </div>
                  <div className="text-xl font-semibold">
                    {data.seller.currentReceivables.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Closed Receivables
                  </div>
                  <div className="text-xl font-semibold">
                    {data.seller.pastReceivables.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Average Days to Payout
                  </div>
                  <div className="text-xl font-semibold">
                    {data.seller.payoutStats.averageDaysToPayout}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Buyer Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Active Positions
                  </div>
                  <div className="text-xl font-semibold">
                    {data.buyer.currentPositions.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Settled Positions
                  </div>
                  <div className="text-xl font-semibold">
                    {data.buyer.pastPositions.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="text-xl font-semibold">Institutional</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {data.type === "Seller" ? (
          <TabsContent value="receivables" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Receivables</CardTitle>
              </CardHeader>
              <CardContent className="rounded-xl border overflow-hidden p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Note ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-[120px]">
                        Open
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.seller.currentReceivables.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.id}</TableCell>
                        <TableCell>{r.buyer}</TableCell>
                        <TableCell className="text-right">
                          {fmtMoney(r.amount, r.currency)}
                        </TableCell>
                        <TableCell>{fmtDate(r.issuedAt)}</TableCell>
                        <TableCell>{fmtDate(r.dueAt)}</TableCell>
                        <TableCell>
                          <Badge variant="default">{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/receivables/${encodeURIComponent(r.id)}`}
                            >
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.seller.currentReceivables.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No open receivables.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Receivables</CardTitle>
              </CardHeader>
              <CardContent className="rounded-xl border overflow-hidden p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Note ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-[120px]">
                        Open
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.seller.pastReceivables.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.id}</TableCell>
                        <TableCell>{r.buyer}</TableCell>
                        <TableCell className="text-right">
                          {fmtMoney(r.amount, r.currency)}
                        </TableCell>
                        <TableCell>{fmtDate(r.issuedAt)}</TableCell>
                        <TableCell>{fmtDate(r.dueAt)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/receivables/${encodeURIComponent(r.id)}`}
                            >
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.seller.pastReceivables.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No historical receivables.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

        {data.type === "Buyer" ? (
          <TabsContent value="positions" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Bought Receivables</CardTitle>
              </CardHeader>
              <CardContent className="rounded-xl border overflow-hidden p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Note ID</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead className="text-right">Face</TableHead>
                      <TableHead>Purchased</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-[120px]">
                        Open
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.buyer.currentPositions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.id}</TableCell>
                        <TableCell>{p.seller}</TableCell>
                        <TableCell className="text-right">
                          {fmtMoney(p.face, p.currency)}
                        </TableCell>
                        <TableCell>{fmtDate(p.purchasedAt)}</TableCell>
                        <TableCell>{fmtDate(p.dueAt)}</TableCell>
                        <TableCell>
                          <Badge variant="default">{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/receivables/${encodeURIComponent(p.id)}`}
                            >
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.buyer.currentPositions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No active positions.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Bought Receivables</CardTitle>
              </CardHeader>
              <CardContent className="rounded-xl border overflow-hidden p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Note ID</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead className="text-right">Face</TableHead>
                      <TableHead>Purchased</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-[120px]">
                        Open
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.buyer.pastPositions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.id}</TableCell>
                        <TableCell>{p.seller}</TableCell>
                        <TableCell className="text-right">
                          {fmtMoney(p.face, p.currency)}
                        </TableCell>
                        <TableCell>{fmtDate(p.purchasedAt)}</TableCell>
                        <TableCell>{fmtDate(p.dueAt)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/receivables/${encodeURIComponent(p.id)}`}
                            >
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.buyer.pastPositions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No settled positions.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
