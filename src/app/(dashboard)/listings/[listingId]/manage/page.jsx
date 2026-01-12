"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Ban, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  useListing,
  useTransitionListing,
} from "@/lib/api/schemas/listing";
import {
  useSearchAsks,
  useCreateAsk,
  useTransitionAsk,
} from "@/lib/api/schemas/ask";
import { useSearchBids } from "@/lib/api/schemas/bid";
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

// Ask form schema
const askFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !Number.isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Must be a positive number"
    ),
  validUntil: z.string().optional(),
  executionMode: z.enum(["MANUAL", "AUTO"]),
  binding: z.boolean(),
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

const getListingStatusColor = (status) => {
  switch (status) {
    case "OPEN":
      return "bg-green-500";
    case "WITHDRAWN":
      return "bg-gray-400";
    case "SUSPENDED":
      return "bg-red-500";
    case "CLOSED":
      return "bg-blue-500";
    default:
      return "bg-gray-300";
  }
};

export default function ListingManagePage() {
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
  const { data: bidsData, isLoading: isLoadingBids } = useSearchBids({
    listingId: [listingId],
    limit: 100,
    sort: "-createdAt",
  });

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

    const activeAsk = sortedAsks.find((ask) => ask.status === "ACTIVE");

    if (activeAsk && dataPoints.length > 0) {
      const now = new Date();
      const lastPoint = dataPoints[dataPoints.length - 1];

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

  // Mutations
  const createAskMutation = useCreateAsk();
  const transitionAskMutation = useTransitionAsk();
  const transitionListingMutation = useTransitionListing();

  // Form for creating ask
  const form = useForm({
    resolver: zodResolver(askFormSchema),
    defaultValues: {
      amount: "",
      validUntil: "",
      executionMode: "MANUAL",
      binding: false,
    },
  });

  const onSubmitAsk = (values) => {
    if (createAskMutation.isPending) return;

    const instrument = listing?.instrument;
    const currency = instrument?.currency || "USD";

    const validUntilISO = values.validUntil
      ? new Date(values.validUntil).toISOString()
      : undefined;

    const askData = {
      listingId: listingId,
      amount: parseFloat(values.amount),
      currency: currency,
      executionMode: values.executionMode,
      binding: values.binding,
      ...(validUntilISO && { validUntil: validUntilISO }),
    };

    createAskMutation.mutate(askData, {
      onSuccess: () => {
        toast.success("Ask created successfully!");
        form.reset();
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to create ask");
      },
    });
  };

  const handleWithdrawAsk = (askId) => {
    if (transitionAskMutation.isPending) return;

    transitionAskMutation.mutate(
      { id: askId, transition: { status: "WITHDRAWN" } },
      {
        onSuccess: () => toast.success("Ask withdrawn successfully!"),
        onError: (error) => toast.error(error?.message || "Failed to withdraw ask"),
      }
    );
  };

  const handleWithdrawListing = () => {
    if (transitionListingMutation.isPending) return;

    transitionListingMutation.mutate(
      { id: listingId, transition: { status: "WITHDRAWN" } },
      {
        onSuccess: () => {
          toast.success("Listing withdrawn successfully!");
          router.push("/receivables/my-listings");
        },
        onError: (error) =>
          toast.error(error?.message || "Failed to withdraw listing"),
      }
    );
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

  // Check if user owns this listing
  const isOwner = listing.sellerCompanyId === me?.companyId;

  if (!isOwner) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You can only manage listings that belong to your company.
          </p>
          <Button asChild>
            <Link href="/receivables/market">Back to Market</Link>
          </Button>
        </div>
      </div>
    );
  }

  const instrument = listing.instrument;
  const currency = instrument?.currency || "USD";
  const activeAsk = asksData?.find((ask) => ask.status === "ACTIVE");
  const pendingBids = bidsData?.filter((bid) => bid.status === "PENDING") || [];
  const isListingOpen = listing.status === "OPEN";

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/receivables/my-listings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Listings
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Manage Listing: {instrument?.name || "Instrument"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getListingStatusColor(listing.status)}>
                {listing.status}
              </Badge>
              <span className="text-muted-foreground text-sm">
                Listed on {fmtDate(listing.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {isListingOpen && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <X className="h-4 w-4 mr-2" />
                Withdraw Listing
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Withdraw Listing?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove your listing from the marketplace. All active
                  asks will remain but the listing will no longer accept new
                  bids. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleWithdrawListing}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {transitionListingMutation.isPending
                    ? "Withdrawing..."
                    : "Withdraw"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Instrument Details */}
      <Card>
        <CardHeader>
          <CardTitle>Instrument Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{instrument?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Face Value</p>
              <p className="font-medium">
                {fmtMoney(instrument?.faceValue, currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maturity Date</p>
              <p className="font-medium">
                {instrument?.maturityDate
                  ? new Date(instrument.maturityDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Ask</p>
              <p className="font-medium text-green-600">
                {activeAsk ? fmtMoney(activeAsk.amount, currency) : "No active ask"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Ask Management */}
        <div className="space-y-6">
          {/* Price History Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Asking Price History</CardTitle>
              <CardDescription>
                Historical asking prices for this listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorAmount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#2563eb"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#2563eb"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) =>
                          `${currency} ${value.toLocaleString()}`
                        }
                        domain={[0, "auto"]}
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
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fill="url(#colorAmount)"
                        name="Ask Price"
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          if (payload.isCurrentPoint) return null;
                          const color = payload.isActive ? "#22c55e" : "#9ca3af";
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
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No asking price history
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create New Ask Form */}
          {isListingOpen && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Ask</CardTitle>
                <CardDescription>
                  Set a new asking price for your listing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitAsk)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ask Amount ({currency})</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter amount"
                              {...field}
                            />
                          </FormControl>
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
                            Leave empty for no expiration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="executionMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Execution Mode</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MANUAL">
                                Manual - Review bids before accepting
                              </SelectItem>
                              <SelectItem value="AUTO">
                                Auto - Automatically match bids at ask price
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="binding"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Binding Offer</FormLabel>
                            <FormDescription>
                              Legally binding once a matching bid is found
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createAskMutation.isPending}
                    >
                      {createAskMutation.isPending
                        ? "Creating..."
                        : "Create Ask"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Active Asks */}
          <Card>
            <CardHeader>
              <CardTitle>Your Asks</CardTitle>
              <CardDescription>Manage your asking prices</CardDescription>
            </CardHeader>
            <CardContent>
              {asksData && asksData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asksData.map((ask) => (
                      <TableRow key={ask.id}>
                        <TableCell className="font-medium">
                          {fmtMoney(ask.amount, currency)}
                          {ask.binding && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Binding
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ask.executionMode}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAskStatusColor(ask.status)}>
                            {ask.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {fmtDate(ask.createdAt)}
                        </TableCell>
                        <TableCell>
                          {ask.status === "ACTIVE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWithdrawAsk(ask.id)}
                              disabled={transitionAskMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No asks created yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bids */}
        <div className="space-y-6">
          {/* Pending Bids */}
          <Card>
            <CardHeader>
              <CardTitle>
                Pending Bids
                {pendingBids.length > 0 && (
                  <Badge className="ml-2">{pendingBids.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Review and respond to bids</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBids.length > 0 ? (
                <div className="space-y-4">
                  {pendingBids.map((bid) => {
                    const bidderCompany = companyMap.get(bid.bidderCompanyId);
                    return (
                      <div
                        key={bid.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-lg">
                            {fmtMoney(bid.amount, bid.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            From:{" "}
                            {bidderCompany?.legalName ||
                              bidderCompany?.tradeName ||
                              bid.bidderCompanyId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fmtDate(bid.createdAt)}
                            {bid.validUntil &&
                              ` - Valid until ${fmtDate(bid.validUntil)}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {/* TODO: Implement bid accept/reject when backend supports it */}
                          <Badge variant="outline">Review Required</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No pending bids at this time
                </p>
              )}
            </CardContent>
          </Card>

          {/* All Bids History */}
          <Card>
            <CardHeader>
              <CardTitle>All Bids</CardTitle>
              <CardDescription>Complete bid history</CardDescription>
            </CardHeader>
            <CardContent>
              {bidsData && bidsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bidder</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bidsData.map((bid) => {
                      const bidderCompany = companyMap.get(bid.bidderCompanyId);
                      return (
                        <TableRow key={bid.id}>
                          <TableCell>
                            <Link
                              href={`/companies/${bid.bidderCompanyId}`}
                              className="text-blue-600 hover:underline"
                            >
                              {bidderCompany?.legalName ||
                                bidderCompany?.tradeName ||
                                "Unknown"}
                            </Link>
                          </TableCell>
                          <TableCell className="font-medium">
                            {fmtMoney(bid.amount, bid.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getBidStatusColor(bid.status)}>
                              {bid.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {fmtDate(bid.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No bids received yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
