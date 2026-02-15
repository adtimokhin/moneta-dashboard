"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Dot,
  Area,
  AreaChart,
} from "recharts";

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useListing } from "@/lib/api/schemas/listing";
import { useSearchAsks } from "@/lib/api/schemas/ask";
import { useSearchBids, useCreateBid } from "@/lib/api/schemas/bid";
import { useSearchCompanies } from "@/lib/api/schemas/company";
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
    hour: "2-digit",
    minute: "2-digit",
  });

// Bid form schema - matches API requirements
const bidFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !Number.isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Must be a positive number"
    ),
  validUntil: z.string().optional(),
});

// Status color helpers
const getAskStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500";
    case "WITHDRAWN":
      return "bg-gray-400";
    case "SUSPENDED":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};

const getBidStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-blue-500";
    case "SELECTED":
      return "bg-green-500";
    case "WITHDRAWN":
      return "bg-gray-400";
    case "SUSPENDED":
      return "bg-red-500";
    case "NOT_SELECTED":
      return "bg-orange-500";
    default:
      return "bg-gray-300";
  }
};

export default function BidPage() {
  const params = useParams();
  const router = useRouter();
  const { me } = useMeStore();

  const listingId = params.listingId;

  // Fetch listing with instrument details
  const {
    data: listing,
    isLoading: isLoadingListing,
    error: listingError,
  } = useListing(listingId, "instrument");

  // Fetch asks for this listing
  const { data: asksData, isLoading: isLoadingAsks } = useSearchAsks({
    listingId: [listingId],
    limit: 100,
    sort: "-createdAt",
  });

  // Fetch bids for this listing
  const { data: bidsData, isLoading: isLoadingBids, error: bidsError } = useSearchBids({
    listingId: [listingId],
    limit: 100,
    sort: "-createdAt",
  });

  // Debug: Log bids data
  React.useEffect(() => {
    console.log("Bids fetch status:", {
      isLoading: isLoadingBids,
      error: bidsError,
      dataLength: bidsData?.length,
      listingIdFilter: listingId,
      rawData: bidsData,
    });
  }, [bidsData, isLoadingBids, bidsError, listingId]);

  // Fetch companies for name resolution
  const { data: companiesData } = useSearchCompanies({
    limit: 200,
  });

  // Create company lookup map
  const companyMap = React.useMemo(() => {
    if (!companiesData) return new Map();
    return new Map(companiesData.map((company) => [company.id, company]));
  }, [companiesData]);

  // Prepare chart data for ask price history
  const chartData = React.useMemo(() => {
    if (!asksData || asksData.length === 0) return [];

    // Sort by creation date ascending for the chart
    const sortedAsks = [...asksData].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const dataPoints = sortedAsks.map((ask) => ({
      timestamp: new Date(ask.createdAt).getTime(),
      date: new Date(ask.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      amount: ask.amount,
      status: ask.status,
      executionMode: ask.executionMode,
      validUntil: ask.validUntil,
      isActive: ask.status === "ACTIVE",
    }));

    // Find the active ask to extend the line to current time
    const activeAsk = sortedAsks.find((ask) => ask.status === "ACTIVE");

    // Add a current time point with the active ask price if available
    if (activeAsk && dataPoints.length > 0) {
      const now = new Date();
      const lastPoint = dataPoints[dataPoints.length - 1];

      // Only add current point if it's different from the last point
      if (now.getTime() > lastPoint.timestamp) {
        dataPoints.push({
          timestamp: now.getTime(),
          date: "Now",
          amount: activeAsk.amount,
          status: activeAsk.status,
          executionMode: activeAsk.executionMode,
          validUntil: activeAsk.validUntil,
          isActive: true,
          isCurrentPoint: true,
        });
      }
    }

    return dataPoints;
  }, [asksData]);

  // Separate user's bids and other bids
  const userBids = React.useMemo(() => {
    const filtered = bidsData?.filter((bid) => bid.bidderCompanyId === me?.companyId) || [];
    console.log("User bids filtering:", {
      totalBids: bidsData?.length,
      userCompanyId: me?.companyId,
      userBidsCount: filtered.length,
      allBidderCompanyIds: bidsData?.map(b => b.bidderCompanyId),
    });
    return filtered;
  }, [bidsData, me?.companyId]);

  const otherBids = React.useMemo(() => {
    const filtered = bidsData?.filter((bid) => bid.bidderCompanyId !== me?.companyId) || [];
    console.log("Other bids filtering:", {
      totalBids: bidsData?.length,
      otherBidsCount: filtered.length,
    });
    return filtered;
  }, [bidsData, me?.companyId]);

  // Create bid mutation
  const createBidMutation = useCreateBid();

  // Form for creating bid
  const form = useForm({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      amount: "",
      validUntil: "",
    },
  });

  const onSubmit = async (values) => {
    // Prevent double submission
    if (createBidMutation.isPending) {
      console.log("Bid submission already in progress, skipping");
      return;
    }

    const instrument = listing?.instrument;
    const currency = instrument?.currency || "USD";

    console.log("Submitting bid with values:", {
      listingId,
      amount: parseFloat(values.amount),
      currency,
      validUntil: values.validUntil,
    });

    // Convert validUntil to ISO 8601 format if provided
    const validUntilISO = values.validUntil
      ? new Date(values.validUntil).toISOString()
      : undefined;

    const bidData = {
      listingId: listingId,
      amount: parseFloat(values.amount),
      currency: currency,
      ...(validUntilISO && { validUntil: validUntilISO }),
    };

    console.log("Bid payload:", bidData);

    createBidMutation.mutate(bidData, {
      onSuccess: (result) => {
        console.log("Bid created successfully:", result);
        toast.success("Bid submitted successfully!");
        form.reset();
      },
      onError: (error) => {
        console.error("Error creating bid - Full error:", error);

        // The error is transformed by toApiError, so it has { code, message, details, status }
        let errorMessage = "Failed to submit bid. Please try again.";

        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.details?.detail) {
          errorMessage = typeof error.details.detail === 'string'
            ? error.details.detail
            : JSON.stringify(error.details.detail);
        }

        toast.error(errorMessage);
      },
    });
  };

  const isLoading = isLoadingListing || isLoadingAsks || isLoadingBids;

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (listingError || !listing) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-red-600">
          Error loading listing: {listingError?.message || "Listing not found"}
        </p>
      </div>
    );
  }

  const instrument = listing.instrument;
  const currency = instrument?.currency || "USD";

  // Separate active and historical asks
  const activeAsk = asksData?.find((ask) => ask.status === "ACTIVE");
  const historicalAsks =
    asksData?.filter((ask) => ask.status !== "ACTIVE") || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/receivables/market">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Market
          </Link>
        </Button>
      </div>

      {/* Instrument Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{instrument?.name || "Instrument"}</CardTitle>
          <CardDescription>
            Face Value: {fmtMoney(instrument?.faceValue || 0, currency)} •
            Maturity: {fmtMoney(instrument?.maturityPayment || 0, currency)} •
            Due: {instrument?.maturityDate}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ask Price Chart & Bid Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ask Price History Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Ask Price History</CardTitle>
              <CardDescription>
                Price changes over time •{" "}
                {activeAsk && (
                  <>
                    Current: {fmtMoney(activeAsk.amount, currency)} ({activeAsk.executionMode})
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          `${currency} ${value.toLocaleString()}`
                        }
                        domain={[0, 'auto']}
                      />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow-lg">
                                <p className="font-semibold">
                                  {fmtMoney(data.amount, currency)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {data.date}
                                </p>
                                {!data.isCurrentPoint && (
                                  <div className="flex gap-2 mt-2">
                                    <Badge
                                      variant={
                                        data.status === "ACTIVE"
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {data.status}
                                    </Badge>
                                    <Badge
                                      variant={
                                        data.executionMode === "AUTO"
                                          ? "default"
                                          : "outline"
                                      }
                                    >
                                      {data.executionMode}
                                    </Badge>
                                  </div>
                                )}
                                {data.isCurrentPoint && (
                                  <Badge variant="default" className="mt-2">
                                    Current Price
                                  </Badge>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fill="url(#colorAmount)"
                        name="Ask Price"
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          // Don't show dot for the current time point (invisible extension)
                          if (payload.isCurrentPoint) return null;

                          const color = payload.isActive
                            ? "#22c55e"
                            : payload.status === "WITHDRAWN"
                            ? "#9ca3af"
                            : "#ef4444";
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={payload.isActive ? 6 : 4}
                              fill={color}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        }}
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No asking price data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bid Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle>Place Your Bid</CardTitle>
              <CardDescription>
                Submit a competitive offer for this instrument
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bid Amount ({currency})</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder={
                              activeAsk
                                ? `e.g., ${activeAsk.amount}`
                                : "Enter amount"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {activeAsk
                            ? `Current ask: ${fmtMoney(
                                activeAsk.amount,
                                currency
                              )}`
                            : "No active ask price"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid Until (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormDescription>
                          When not specified, your bid remains valid until withdrawn or the listing closes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createBidMutation.isPending}
                  >
                    {createBidMutation.isPending ? "Submitting..." : "Submit Bid"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bid & Ask Trackers */}
        <div className="space-y-6">
          {/* Bid Tracker */}
          <Card>
            <CardHeader>
              <CardTitle>Bid Activity</CardTitle>
              <CardDescription>All bids on this listing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Your Bids */}
                {userBids.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Your Bids</h4>
                    <div className="relative pl-4">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
                      {userBids.map((bid, idx) => (
                        <TooltipProvider key={bid.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative mb-4 cursor-pointer">
                                <div
                                  className={`absolute left-[-8px] w-4 h-4 rounded-full ${getBidStatusColor(
                                    bid.status
                                  )} border-2 border-white`}
                                />
                                <div className="ml-4 text-sm">
                                  <div className="font-medium">
                                    {fmtMoney(bid.amount, bid.currency)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {fmtDate(bid.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-semibold">Bid Details</p>
                                <p>
                                  Amount: {fmtMoney(bid.amount, bid.currency)}
                                </p>
                                <p>Status: {bid.status}</p>
                                <p>Valid Until: {fmtDate(bid.validUntil)}</p>
                                <p>Created: {fmtDate(bid.createdAt)}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Bids */}
                {otherBids.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Other Bids</h4>
                    <div className="relative pl-4">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
                      {otherBids.map((bid) => {
                        const company = companyMap.get(bid.bidderCompanyId);
                        return (
                          <TooltipProvider key={bid.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative mb-4 cursor-pointer">
                                  <div
                                    className={`absolute left-[-8px] w-4 h-4 rounded-full ${getBidStatusColor(
                                      bid.status
                                    )} border-2 border-white`}
                                  />
                                  <div className="ml-4 text-sm">
                                    <div className="font-medium">
                                      {company?.legalName || "Anonymous"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {fmtDate(bid.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-semibold">Bid Details</p>
                                  <p>
                                    Company: {company?.legalName || "Anonymous"}
                                  </p>
                                  <p>Status: {bid.status}</p>
                                  <p>Valid Until: {fmtDate(bid.validUntil)}</p>
                                  <p>Created: {fmtDate(bid.createdAt)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Amount hidden for competitive reasons
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>
                )}

                {userBids.length === 0 && otherBids.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No bids yet. Be the first to bid!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ask Tracker */}
          <Card>
            <CardHeader>
              <CardTitle>Ask History</CardTitle>
              <CardDescription>Price changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
                {asksData?.map((ask, idx) => {
                  const isActive = ask.status === "ACTIVE";
                  const prevAsk = asksData[idx + 1];
                  const priceChange = prevAsk
                    ? ((ask.amount - prevAsk.amount) / prevAsk.amount) * 100
                    : 0;

                  return (
                    <TooltipProvider key={ask.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative mb-4 cursor-pointer">
                            <div
                              className={`absolute left-[-8px] w-4 h-4 rounded-full ${getAskStatusColor(
                                ask.status
                              )} border-2 border-white ${
                                isActive ? "ring-2 ring-green-300" : ""
                              }`}
                            />
                            <div className="ml-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {fmtMoney(ask.amount, ask.currency)}
                                </span>
                                {prevAsk && priceChange !== 0 && (
                                  <span
                                    className={`text-xs flex items-center ${
                                      priceChange > 0
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {priceChange > 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(priceChange).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {fmtDate(ask.createdAt)}
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-semibold">Ask Details</p>
                            <p>Amount: {fmtMoney(ask.amount, ask.currency)}</p>
                            <p>Status: {ask.status}</p>
                            <p>Mode: {ask.executionMode}</p>
                            <p>Binding: {ask.binding ? "Yes" : "No"}</p>
                            <p>Valid Until: {fmtDate(ask.validUntil)}</p>
                            <p>Created: {fmtDate(ask.createdAt)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                {!asksData ||
                  (asksData.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No asking prices available
                    </p>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
