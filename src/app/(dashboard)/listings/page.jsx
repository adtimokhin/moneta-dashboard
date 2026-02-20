"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Settings, Eye, FileText } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useSearchListings, useCreateListing } from "@/lib/api/schemas/listing";
import { useSearchAsks } from "@/lib/api/schemas/ask";
import { useSearchInstruments } from "@/lib/api/schemas/instrument";
import { useMeStore } from "@/lib/persist/auth/meStore";
import { useMe } from "@/lib/api/schemas/user/hooks";
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

const getInstrumentStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500";
    case "DRAFT":
      return "bg-yellow-500";
    case "SUSPENDED":
      return "bg-red-500";
    case "MATURED":
      return "bg-blue-500";
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

export default function MyListingsPage() {
  const { me: storedMe } = useMeStore();
  const { data: fetchedMe, isPending: isMePending } = useMe();
  const me = fetchedMe ?? storedMe;
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [activeTab, setActiveTab] = React.useState("listings");

  // Permission checks
  const canCreateInstrument = me?.role === "ADMIN" || me?.role === "ISSUER";
  const canCreateListing = me?.role === "ADMIN" || me?.role === "SELLER";
  const canManageListing = me?.role === "ADMIN" || me?.role === "SELLER";

  // Fetch listings for user's company
  const {
    data: listingsData,
    isLoading: isLoadingListings,
    error: listingsError,
  } = useSearchListings(
    {
      sellerCompanyId: me?.companyId ? [me.companyId] : undefined,
      ...(statusFilter !== "ALL" && { status: statusFilter }),
      limit: 200,
      sort: "-createdAt",
    },
    "instrument"
  );

  // Fetch instruments issued by the company
  const { data: instrumentsData, isLoading: isLoadingInstruments } =
    useSearchInstruments({
      issuerId: me?.companyId ? [me.companyId] : undefined,
      limit: 200,
    });

  // Debug logging
  React.useEffect(() => {
    console.log("My Listings Debug:", {
      me,
      companyId: me?.companyId,
      listingsLoading: isLoadingListings,
      listingsError,
      listingsCount: listingsData?.length,
      listingsData,
      instrumentsLoading: isLoadingInstruments,
      instrumentsCount: instrumentsData?.length,
      instrumentsData,
    });
  }, [
    me,
    isLoadingListings,
    listingsError,
    listingsData,
    isLoadingInstruments,
    instrumentsData,
  ]);

  // Fetch all asks to get current ask prices
  const listingIds = React.useMemo(
    () => listingsData?.map((l) => l.id) || [],
    [listingsData]
  );

  const { data: asksData } = useSearchAsks({
    listingId: listingIds.length > 0 ? listingIds : undefined,
    status: "ACTIVE",
    limit: 200,
  });

  // Create a map of listing ID to active ask
  const activeAskMap = React.useMemo(() => {
    if (!asksData) return new Map();
    const map = new Map();
    asksData.forEach((ask) => {
      const existing = map.get(ask.listingId);
      if (!existing || new Date(ask.createdAt) > new Date(existing.createdAt)) {
        map.set(ask.listingId, ask);
      }
    });
    return map;
  }, [asksData]);

  // Create a set of instrument IDs that have OPEN listings
  const instrumentsWithOpenListings = React.useMemo(() => {
    if (!listingsData) return new Set();
    return new Set(
      listingsData.filter((l) => l.status === "OPEN").map((l) => l.instrumentId)
    );
  }, [listingsData]);

  // Create a map of instrument ID to listing for quick lookup
  const instrumentToListingMap = React.useMemo(() => {
    if (!listingsData) return new Map();
    const map = new Map();
    listingsData.forEach((listing) => {
      // Prefer OPEN listings over others
      const existing = map.get(listing.instrumentId);
      if (!existing || listing.status === "OPEN") {
        map.set(listing.instrumentId, listing);
      }
    });
    return map;
  }, [listingsData]);

  // Instruments that can have a new listing created
  const instrumentsWithoutOpenListing = React.useMemo(() => {
    if (!instrumentsData) return [];
    return instrumentsData.filter(
      (inst) =>
        inst.instrumentStatus === "ACTIVE" &&
        !instrumentsWithOpenListings.has(inst.id)
    );
  }, [instrumentsData, instrumentsWithOpenListings]);

  // Create listing mutation
  const createListingMutation = useCreateListing();

  const handleCreateListing = (instrumentId) => {
    if (createListingMutation.isPending) return;

    createListingMutation.mutate(
      { instrumentId },
      {
        onSuccess: (newListing) => {
          toast.success("Listing created successfully!");
          router.push(`/listings/${newListing.id}/manage`);
        },
        onError: (error) => {
          console.error("Failed to create listing:", error);
          toast.error(error?.message || "Failed to create listing");
        },
      }
    );
  };

  // Statistics
  const stats = React.useMemo(() => {
    if (!listingsData) return { total: 0, open: 0, closed: 0, withdrawn: 0 };

    return {
      total: listingsData.length,
      open: listingsData.filter((l) => l.status === "OPEN").length,
      closed: listingsData.filter((l) => l.status === "CLOSED").length,
      withdrawn: listingsData.filter((l) => l.status === "WITHDRAWN").length,
    };
  }, [listingsData]);

  if (!me?.companyId) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">
          {isMePending ? "Loading..." : "Please log in to view your listings."}
        </p>
      </div>
    );
  }

  if (listingsError) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-red-600">
          Error loading listings: {listingsError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your company&apos;s instrument listings
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Listings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Closed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.closed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Withdrawn</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-500">
              {stats.withdrawn}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Listings and Instruments */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="listings">
            Listings ({listingsData?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="instruments">
            Instruments ({instrumentsData?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Listings</CardTitle>
                  <CardDescription>
                    All listings created by your company
                  </CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingListings ? (
                <p className="text-center py-8 text-muted-foreground">
                  Loading listings...
                </p>
              ) : listingsData && listingsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instrument</TableHead>
                      <TableHead>Face Value</TableHead>
                      <TableHead>Current Ask</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Listed Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listingsData.map((listing) => {
                      const instrument = listing.instrument;
                      const currency = instrument?.currency || "USD";
                      const activeAsk = activeAskMap.get(listing.id);

                      return (
                        <TableRow key={listing.id}>
                          <TableCell>
                            <div>
                              {instrument?.id ? (
                                <Link
                                  href={`/instruments/${instrument.id}`}
                                  className="font-medium hover:underline text-primary"
                                >
                                  {instrument.name || "Unknown Instrument"}
                                </Link>
                              ) : (
                                <p className="font-medium">
                                  {instrument?.name || "Unknown Instrument"}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {listing.id.slice(0, 8)}...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {instrument?.faceValue
                              ? fmtMoney(instrument.faceValue, currency)
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {activeAsk ? (
                              <span className="text-green-600 font-medium">
                                {fmtMoney(activeAsk.amount, activeAsk.currency)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                No active ask
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getListingStatusColor(listing.status)}
                            >
                              {listing.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {fmtDate(listing.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/listings/${listing.id}/bid`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              {listing.status === "OPEN" && canManageListing && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    href={`/listings/${listing.id}/manage`}
                                  >
                                    <Settings className="h-4 w-4 mr-1" />
                                    Manage
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No listings found for your company.
                  </p>
                  {instrumentsWithoutOpenListing.length > 0 && canCreateListing ? (
                    <Button onClick={() => setActiveTab("instruments")}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Instruments to List
                    </Button>
                  ) : canCreateInstrument ? (
                    <Button asChild>
                      <Link href="/instruments/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Instrument
                      </Link>
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instruments Tab */}
        <TabsContent value="instruments">
          <Card>
            <CardHeader>
              <CardTitle>Your Instruments</CardTitle>
              <CardDescription>
                Instruments issued by your company. Create listings to offer
                them for sale.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInstruments ? (
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
                      <TableHead>Status</TableHead>
                      <TableHead>Trading</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instrumentsData.map((instrument) => {
                      const hasOpenListing = instrumentsWithOpenListings.has(
                        instrument.id
                      );
                      const existingListing = instrumentToListingMap.get(
                        instrument.id
                      );
                      const canCreateListingForInstrument =
                        instrument.instrumentStatus === "ACTIVE" &&
                        !hasOpenListing;

                      return (
                        <TableRow key={instrument.id}>
                          <TableCell>
                            <div>
                              <Link
                                href={`/instruments/${instrument.id}`}
                                className="font-medium hover:underline text-primary"
                              >
                                {instrument.name}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {instrument.id.slice(0, 8)}...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {fmtMoney(
                              instrument.faceValue,
                              instrument.currency
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {fmtDate(instrument.maturityDate)}
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
                              className={getTradingStatusColor(
                                instrument.tradingStatus
                              )}
                            >
                              {instrument.tradingStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/instruments/${instrument.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              {hasOpenListing && existingListing && canManageListing ? (
                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    href={`/listings/${existingListing.id}/manage`}
                                  >
                                    <Settings className="h-4 w-4 mr-1" />
                                    Manage Listing
                                  </Link>
                                </Button>
                              ) : canCreateListing && canCreateListingForInstrument ? (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    handleCreateListing(instrument.id)
                                  }
                                  disabled={createListingMutation.isPending}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  {createListingMutation.isPending
                                    ? "Creating..."
                                    : "Create Listing"}
                                </Button>
                              ) : !canCreateListing ? null : (
                                <span className="text-xs text-muted-foreground">
                                  {instrument.instrumentStatus !== "ACTIVE"
                                    ? "Not active"
                                    : "Has listing"}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
