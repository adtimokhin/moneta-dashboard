"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  ShoppingCart,
  FileText,
  Calendar,
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchInstruments } from "@/lib/api/schemas/instrument";
import { useSearchListings } from "@/lib/api/schemas/listing";

// TODO: This page requires ownership/transaction data which is not available in the current API
// For now, we'll fetch all instruments created by the user and listings
// In the future, we need:
// - GET /v1/ownership/search - to get instruments owned by the user
// - Transaction history endpoint
// Sample receivables data (fallback if API not available)
const receivablesDataFallback = [
  {
    id: "R001",
    name: "Invoice ABC Corp",
    type: "purchased",
    value: 150000,
    status: "awaiting_payment",
    daysRemaining: 15,
    totalDays: 45,
    issuer: "ABC Corporation",
    createdDate: "2024-10-15",
  },
  {
    id: "R002",
    name: "Trade Doc XYZ Ltd",
    type: "created",
    value: 250000,
    status: "has_buyer",
    daysRemaining: 30,
    totalDays: 60,
    buyer: "Investment Fund A",
    issuer: "XYZ Limited",
    createdDate: "2024-10-20",
  },
  {
    id: "R003",
    name: "Contract DEF Inc",
    type: "purchased",
    value: 75000,
    status: "awaiting_payment",
    daysRemaining: 5,
    totalDays: 30,
    issuer: "DEF Industries",
    createdDate: "2024-11-01",
  },
  {
    id: "R004",
    name: "Invoice GHI Co",
    type: "created",
    value: 180000,
    status: "no_buyer",
    daysRemaining: 45,
    totalDays: 45,
    issuer: "GHI Company",
    createdDate: "2024-10-25",
  },
  {
    id: "R005",
    name: "Purchase Order JKL",
    type: "purchased",
    value: 320000,
    status: "awaiting_payment",
    daysRemaining: 22,
    totalDays: 60,
    issuer: "JKL Enterprises",
    createdDate: "2024-10-10",
  },
  {
    id: "R006",
    name: "Agreement MNO Ltd",
    type: "created",
    value: 95000,
    status: "has_buyer",
    daysRemaining: 12,
    totalDays: 30,
    buyer: "Investment Fund B",
    issuer: "MNO Limited",
    createdDate: "2024-10-28",
  },
];

// Calculate statistics
const totalValue = receivablesData.reduce((sum, r) => sum + r.value, 0);
const purchasedValue = receivablesData
  .filter((r) => r.type === "purchased")
  .reduce((sum, r) => sum + r.value, 0);
const createdValue = receivablesData
  .filter((r) => r.type === "created")
  .reduce((sum, r) => sum + r.value, 0);

// Data for pie chart (by type)
const typeData = [
  {
    name: "Purchased",
    value: purchasedValue,
    count: receivablesData.filter((r) => r.type === "purchased").length,
  },
  {
    name: "Created",
    value: createdValue,
    count: receivablesData.filter((r) => r.type === "created").length,
  },
];

// Data for status breakdown
const statusData = [
  {
    name: "Awaiting Payment",
    value: receivablesData.filter((r) => r.status === "awaiting_payment")
      .length,
  },
  {
    name: "Has Buyer",
    value: receivablesData.filter((r) => r.status === "has_buyer").length,
  },
  {
    name: "No Buyer",
    value: receivablesData.filter((r) => r.status === "no_buyer").length,
  },
];

// Data for timeline chart
const timelineData = receivablesData.map((r) => ({
  name: r.id,
  remaining: r.daysRemaining,
  total: r.totalDays,
}));

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const getStatusColor = (status) => {
  switch (status) {
    case "awaiting_payment":
      return "bg-blue-500";
    case "has_buyer":
      return "bg-green-500";
    case "no_buyer":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "awaiting_payment":
      return "Awaiting Payment";
    case "has_buyer":
      return "Has Buyer";
    case "no_buyer":
      return "No Buyer";
    default:
      return status;
  }
};

const getUrgencyLevel = (daysRemaining) => {
  if (daysRemaining <= 7) return { level: "urgent", color: "text-red-500" };
  if (daysRemaining <= 15)
    return { level: "warning", color: "text-yellow-500" };
  return { level: "normal", color: "text-green-500" };
};

const getInstrumentDisplayStatus = (instrument) => {
  // Map instrument statuses to display statuses
  // TODO: This mapping is approximate - need proper ownership/transaction data
  if (instrument.maturityStatus === "PAID") return "paid";
  if (instrument.maturityStatus === "DUE") return "awaiting_payment";
  if (instrument.tradingStatus === "LISTED") return "no_buyer";
  if (instrument.tradingStatus === "UNDER_OFFER") return "has_buyer";
  return "awaiting_payment";
};

export default function ReceivablesLifecyclePage() {
  const [filterType, setFilterType] = useState("all");

  // TODO: Need ownership/transaction endpoints to properly implement this page
  // For now, we fetch all ACTIVE instruments as a placeholder
  // Required endpoints:
  // - GET /v1/ownership/search?ownerId={userId} - get instruments owned by user (purchased)
  // - GET /v1/instrument/search with createdBy filter - get instruments created by user
  const { data: allInstruments, isLoading, error } = useSearchInstruments({
    instrumentStatus: "ACTIVE",
    limit: 200,
  });

  // Transform API data to match the expected format
  const receivablesData = useMemo(() => {
    if (!allInstruments) return receivablesDataFallback;

    return allInstruments.map((instrument) => {
      const now = new Date();
      const maturityDate = new Date(instrument.maturityDate);
      const createdDate = new Date(instrument.createdAt);
      const totalDays = Math.ceil(
        (maturityDate - createdDate) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = Math.ceil(
        (maturityDate - now) / (1000 * 60 * 60 * 24)
      );

      return {
        id: instrument.id,
        name: instrument.name,
        type: "created", // TODO: Determine if purchased or created based on ownership data
        value: instrument.faceValue,
        status: getInstrumentDisplayStatus(instrument),
        daysRemaining,
        totalDays,
        issuer: instrument.issuerId,
        createdDate: instrument.createdAt,
      };
    });
  }, [allInstruments]);

  const filteredData =
    filterType === "all"
      ? receivablesData
      : receivablesData.filter((r) => r.type === filterType);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">
            Loading receivables portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex items-center justify-center py-10">
          <p className="text-red-600">Error loading data: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            Receivables Lifecycle Tracker
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your receivables portfolio
          </p>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Receivables</SelectItem>
            <SelectItem value="purchased">Purchased Only</SelectItem>
            <SelectItem value="created">Created Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {receivablesData.length} receivables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchased</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${purchasedValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {typeData[0].count} receivables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${createdValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {typeData[1].count} receivables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receivablesData.filter((r) => r.daysRemaining <= 7).length}
            </div>
            <p className="text-xs text-muted-foreground">Due within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie Chart - Value Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Value Distribution by Type</CardTitle>
            <CardDescription>
              Breakdown of total receivables value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>
              Number of receivables by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Days Remaining Timeline</CardTitle>
          <CardDescription>
            Time remaining until payment or maturity for each receivable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={60} />
              <Tooltip />
              <Legend />
              <Bar dataKey="remaining" fill="#00C49F" name="Days Remaining" />
              <Bar dataKey="total" fill="#E0E0E0" name="Total Days" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Receivables Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Active Receivables</CardTitle>
          <CardDescription>
            Detailed view of each receivable in the portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredData.map((receivable) => {
            const urgency = getUrgencyLevel(receivable.daysRemaining);
            const progressPercentage =
              ((receivable.totalDays - receivable.daysRemaining) /
                receivable.totalDays) *
              100;

            return (
              <div
                key={receivable.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{receivable.name}</h3>
                      <Badge variant="outline">
                        {receivable.type === "purchased" ? (
                          <ShoppingCart className="h-3 w-3 mr-1" />
                        ) : (
                          <FileText className="h-3 w-3 mr-1" />
                        )}
                        {receivable.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {receivable.issuer} • ID: {receivable.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      ${receivable.value.toLocaleString()}
                    </div>
                    <div
                      className={`text-sm font-medium flex items-center gap-1 justify-end ${urgency.color}`}
                    >
                      <Clock className="h-3 w-3" />
                      {receivable.daysRemaining} days
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Status: {getStatusLabel(receivable.status)}
                    </span>
                    {receivable.buyer && (
                      <span className="text-muted-foreground">
                        Buyer: {receivable.buyer}
                      </span>
                    )}
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {receivable.totalDays - receivable.daysRemaining} days
                      elapsed
                    </span>
                    <span>{receivable.daysRemaining} days remaining</span>
                  </div>
                </div>

                {receivable.type === "purchased" && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="bg-blue-50">
                      Awaiting payment from issuer
                    </Badge>
                  </div>
                )}

                {receivable.type === "created" &&
                  receivable.status === "has_buyer" && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-green-50">
                        Payment due to {receivable.buyer}
                      </Badge>
                    </div>
                  )}

                {receivable.type === "created" &&
                  receivable.status === "no_buyer" && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-yellow-50">
                        Seeking buyer
                      </Badge>
                    </div>
                  )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
