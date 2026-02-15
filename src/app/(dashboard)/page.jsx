"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  FileText,
  TrendingUp,
  Clock,
  ChevronRight,
  Building2,
  Receipt,
  ShoppingCart,
  Banknote,
  Plus,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/lib/api/schemas/user";
import { useSearchInstruments } from "@/lib/api/schemas/instrument";
import { useSearchListings } from "@/lib/api/schemas/listing";
import { useSearchCompanies } from "@/lib/api/schemas/company";

// Fake payment data for upcoming payments (payments endpoint not implemented)
const upcomingPayments = [
  {
    id: "1",
    type: "incoming",
    amount: 125000,
    currency: "USD",
    dueDate: "2025-01-15",
    counterparty: "ABC Corporation",
    instrument: "Invoice #INV-2024-001",
  },
  {
    id: "2",
    type: "incoming",
    amount: 85000,
    currency: "USD",
    dueDate: "2025-01-18",
    counterparty: "XYZ Industries",
    instrument: "Invoice #INV-2024-002",
  },
  {
    id: "3",
    type: "outgoing",
    amount: 45000,
    currency: "USD",
    dueDate: "2025-01-20",
    counterparty: "Global Suppliers Ltd",
    instrument: "PO #PO-2024-089",
  },
  {
    id: "4",
    type: "incoming",
    amount: 210000,
    currency: "USD",
    dueDate: "2025-01-22",
    counterparty: "Tech Solutions Inc",
    instrument: "Invoice #INV-2024-003",
    overdue: true,
  },
];

// Fake recent documents (documents endpoint not fully implemented)
const recentDocuments = [
  {
    id: "1",
    name: "Invoice_Q4_2024.pdf",
    type: "Invoice",
    uploadDate: "2025-01-10",
    status: "Verified",
  },
  {
    id: "2",
    name: "Contract_Agreement.docx",
    type: "Contract",
    uploadDate: "2025-01-09",
    status: "Pending",
  },
  {
    id: "3",
    name: "Financial_Statement.xlsx",
    type: "Financial",
    uploadDate: "2025-01-08",
    status: "Verified",
  },
];

const getInstrumentStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "DRAFT":
      return "secondary";
    case "PENDING_APPROVAL":
      return "outline";
    case "MATURED":
      return "default";
    case "REJECTED":
    case "SUSPENDED":
      return "destructive";
    default:
      return "outline";
  }
};

const getListingStatusColor = (status) => {
  switch (status) {
    case "OPEN":
      return "default";
    case "CLOSED":
      return "secondary";
    case "WITHDRAWN":
    case "SUSPENDED":
      return "destructive";
    default:
      return "outline";
  }
};

const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function DashboardPage() {
  const { data: me, isLoading: isMeLoading } = useMe();

  // Fetch instruments for the user's company
  const instrumentFilters = useMemo(
    () => ({
      issuerId: me?.companyId ? [me.companyId] : undefined,
      limit: 200,
    }),
    [me?.companyId]
  );

  const {
    data: instruments,
    isLoading: isInstrumentsLoading,
  } = useSearchInstruments(instrumentFilters);

  // Fetch listings
  const listingFilters = useMemo(
    () => ({
      sellerCompanyId: me?.companyId ? [me.companyId] : undefined,
      limit: 200,
    }),
    [me?.companyId]
  );

  const {
    data: listings,
    isLoading: isListingsLoading,
  } = useSearchListings(listingFilters, "instrument");

  // Fetch companies
  const {
    data: companies,
    isLoading: isCompaniesLoading,
  } = useSearchCompanies({ limit: 100 });

  // Calculate instrument statistics
  const instrumentStats = useMemo(() => {
    if (!instruments) return null;

    const totalValue = instruments.reduce((sum, inst) => sum + (inst.faceValue || 0), 0);
    const activeCount = instruments.filter((i) => i.instrumentStatus === "ACTIVE").length;
    const draftCount = instruments.filter((i) => i.instrumentStatus === "DRAFT").length;
    const pendingCount = instruments.filter((i) => i.instrumentStatus === "PENDING_APPROVAL").length;
    const maturedCount = instruments.filter((i) => i.maturityStatus === "PAID" || i.maturityStatus === "MATURED").length;

    // Group by status for breakdown
    const byStatus = instruments.reduce((acc, inst) => {
      const status = inst.instrumentStatus || "UNKNOWN";
      if (!acc[status]) acc[status] = { count: 0, value: 0 };
      acc[status].count++;
      acc[status].value += inst.faceValue || 0;
      return acc;
    }, {});

    return {
      total: instruments.length,
      totalValue,
      activeCount,
      draftCount,
      pendingCount,
      maturedCount,
      byStatus,
    };
  }, [instruments]);

  // Calculate listing statistics
  const listingStats = useMemo(() => {
    if (!listings) return null;

    const openCount = listings.filter((l) => l.status === "OPEN").length;
    const closedCount = listings.filter((l) => l.status === "CLOSED").length;

    const totalListedValue = listings
      .filter((l) => l.status === "OPEN" && l.instrument)
      .reduce((sum, l) => sum + (l.instrument?.faceValue || 0), 0);

    return {
      total: listings.length,
      openCount,
      closedCount,
      totalListedValue,
    };
  }, [listings]);

  // Calculate payment statistics (from fake data)
  const paymentStats = useMemo(() => {
    const incoming = upcomingPayments
      .filter((p) => p.type === "incoming")
      .reduce((sum, p) => sum + p.amount, 0);
    const outgoing = upcomingPayments
      .filter((p) => p.type === "outgoing")
      .reduce((sum, p) => sum + p.amount, 0);
    const overdueCount = upcomingPayments.filter((p) => p.overdue).length;

    return { incoming, outgoing, overdueCount };
  }, []);

  const isLoading = isMeLoading || isInstrumentsLoading || isListingsLoading || isCompaniesLoading;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{me?.firstName ? `, ${me.firstName}` : ""}! Here's an overview of your financial instruments and market activity.
        </p>
      </div>

      {/* Key Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Instruments Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instrument Value</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(instrumentStats?.totalValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {instrumentStats?.total || 0} instruments total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{listingStats?.openCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(listingStats?.totalListedValue || 0)} listed value
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Expected Incoming */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Incoming</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(paymentStats.incoming)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.overdueCount > 0 && (
                <span className="text-destructive">{paymentStats.overdueCount} overdue</span>
              )}
              {paymentStats.overdueCount === 0 && "Next 30 days"}
            </p>
          </CardContent>
        </Card>

        {/* Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{companies?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Registered partners</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Instruments Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Instruments Overview</CardTitle>
                <CardDescription>Your financial instruments by status</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/instruments">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : instrumentStats && instrumentStats.total > 0 ? (
              <>
                <div className="space-y-3">
                  {instrumentStats.activeCount > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Badge variant="default">Active</Badge>
                          <span className="text-muted-foreground">({instrumentStats.activeCount})</span>
                        </span>
                        <span className="font-medium">
                          {formatCurrency(instrumentStats.byStatus?.ACTIVE?.value || 0)}
                        </span>
                      </div>
                      <Progress
                        value={(instrumentStats.activeCount / instrumentStats.total) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {instrumentStats.pendingCount > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Badge variant="outline">Pending Approval</Badge>
                          <span className="text-muted-foreground">({instrumentStats.pendingCount})</span>
                        </span>
                        <span className="font-medium">
                          {formatCurrency(instrumentStats.byStatus?.PENDING_APPROVAL?.value || 0)}
                        </span>
                      </div>
                      <Progress
                        value={(instrumentStats.pendingCount / instrumentStats.total) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {instrumentStats.draftCount > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary">Draft</Badge>
                          <span className="text-muted-foreground">({instrumentStats.draftCount})</span>
                        </span>
                        <span className="font-medium">
                          {formatCurrency(instrumentStats.byStatus?.DRAFT?.value || 0)}
                        </span>
                      </div>
                      <Progress
                        value={(instrumentStats.draftCount / instrumentStats.total) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/instruments/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Instrument
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-6">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No instruments yet</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/instruments/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Instrument
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listings Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Market Listings</CardTitle>
                <CardDescription>Your active and recent listings</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/listings">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="space-y-3">
                {listings.slice(0, 4).map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {listing.instrument?.name || `Listing ${listing.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.instrument
                          ? formatCurrency(listing.instrument.faceValue, listing.instrument.currency)
                          : "—"}
                      </p>
                    </div>
                    <Badge variant={getListingStatusColor(listing.status)}>
                      {listing.status}
                    </Badge>
                  </div>
                ))}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/listings/market">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Browse Market
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No listings yet</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/listings/market">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Browse Market
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>Expected payments in the next 30 days</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/payments">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Payment Summary */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Incoming</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(paymentStats.incoming)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Outgoing</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(paymentStats.outgoing)}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Net Position</p>
              <p className="text-lg font-bold">
                {formatCurrency(paymentStats.incoming - paymentStats.outgoing)}
              </p>
            </div>
          </div>

          {/* Payment List */}
          <div className="space-y-2">
            {upcomingPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {payment.type === "incoming" ? (
                    <ArrowDownCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowUpCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{payment.counterparty}</p>
                    <p className="text-xs text-muted-foreground">{payment.instrument}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      payment.type === "incoming" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {payment.type === "incoming" ? "+" : "-"}
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {payment.overdue && (
                      <AlertCircle className="h-3 w-3 text-destructive" />
                    )}
                    <p
                      className={`text-xs ${
                        payment.overdue ? "text-destructive font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {payment.overdue ? "Overdue" : formatDate(payment.dueDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row: Quick Actions & Recent Documents */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/instruments/create">
                <Receipt className="mr-2 h-4 w-4" />
                Create New Instrument
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/listings/market">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Browse Market Listings
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/payments">
                <Banknote className="mr-2 h-4 w-4" />
                View Payments
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/companies">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Companies
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>Latest uploaded documents</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/documents">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} - {formatDate(doc.uploadDate)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={doc.status === "Verified" ? "default" : "secondary"}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
