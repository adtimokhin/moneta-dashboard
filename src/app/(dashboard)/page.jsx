"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  FileText,
  Users,
  TrendingUp,
  Clock,
  Download,
  Eye,
  MoreHorizontal,
  ChevronRight,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useMe, useUsers } from "@/lib/api/schemas/user";

// Sample data for weekly payments
const weeklyPayments = [
  {
    date: "2024-11-11",
    day: "Mon",
    events: [
      { type: "incoming", amount: 50000, description: "Payment from XYZ Corp" },
    ],
  },
  {
    date: "2024-11-12",
    day: "Tue",
    events: [
      {
        type: "incoming",
        amount: 180000,
        description: "Payment from GHI Company",
        overdue: true,
      },
    ],
  },
  {
    date: "2024-11-13",
    day: "Wed",
    events: [],
  },
  {
    date: "2024-11-14",
    day: "Thu",
    events: [],
  },
  {
    date: "2024-11-15",
    day: "Fri",
    events: [
      {
        type: "incoming",
        amount: 150000,
        description: "Payment from ABC Corp",
      },
    ],
  },
  {
    date: "2024-11-16",
    day: "Sat",
    events: [
      {
        type: "incoming",
        amount: 75000,
        description: "Payment from DEF Industries",
      },
    ],
  },
  {
    date: "2024-11-17",
    day: "Sun",
    events: [],
  },
];

// Sample recent documents
const recentDocuments = [
  {
    id: "1",
    name: "Invoice_2024_Q4.pdf",
    type: "Invoice",
    uploadedBy: "John Doe",
    uploadDate: "2024-11-10",
    size: "2.4 MB",
    status: "Approved",
  },
  {
    id: "2",
    name: "Contract_Agreement_XYZ.docx",
    type: "Contract",
    uploadedBy: "Jane Smith",
    uploadDate: "2024-11-09",
    size: "1.8 MB",
    status: "Pending",
  },
  {
    id: "3",
    name: "Financial_Statement_Nov.xlsx",
    type: "Financial",
    uploadedBy: "Mike Johnson",
    uploadDate: "2024-11-08",
    size: "3.2 MB",
    status: "Approved",
  },
  {
    id: "4",
    name: "Trade_Doc_ABC.pdf",
    type: "Trade Document",
    uploadedBy: "Sarah Williams",
    uploadDate: "2024-11-07",
    size: "1.5 MB",
    status: "Approved",
  },
  {
    id: "5",
    name: "Purchase_Order_789.pdf",
    type: "Purchase Order",
    uploadedBy: "Emily Brown",
    uploadDate: "2024-11-06",
    size: "890 KB",
    status: "Pending",
  },
];

// Statistics data
const stats = {
  totalReceivables: 1250000,
  activeMembers: 24,
  pendingPayments: 5,
  documentsUploaded: 142,
};

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "Approved":
      return "default";
    case "Pending":
      return "secondary";
    case "Rejected":
      return "destructive";
    default:
      return "outline";
  }
};

const isToday = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export default function DashboardPage() {
  const totalWeeklyIncoming = weeklyPayments.reduce(
    (sum, day) =>
      sum +
      day.events
        .filter((e) => e.type === "incoming")
        .reduce((s, e) => s + e.amount, 0),
    0
  );

  const totalWeeklyOutgoing = weeklyPayments.reduce(
    (sum, day) =>
      sum +
      day.events
        .filter((e) => e.type === "outgoing")
        .reduce((s, e) => s + e.amount, 0),
    0
  );

  const { data: me, isLoading } = useMe();
  console.log("me", me);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your receivables today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Receivables
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalReceivables.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">2 due within 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documentsUploaded}</div>
            <p className="text-xs text-muted-foreground">
              5 uploaded this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Payment Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>This Week's Payments</CardTitle>
              <CardDescription>
                Upcoming payment schedule for the next 7 days
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/calendar">
                View Full Calendar
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Weekly Summary */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Expected Incoming</p>
                    <p className="text-xl font-bold text-green-600">
                      ${totalWeeklyIncoming.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Expected Outgoing</p>
                    <p className="text-xl font-bold text-red-600">
                      ${totalWeeklyOutgoing.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Timeline */}
            <div className="grid grid-cols-7 gap-2">
              {weeklyPayments.map((day) => {
                const hasEvents = day.events.length > 0;
                const hasOverdue = day.events.some((e) => e.overdue);
                const todayDate = isToday(day.date);

                return (
                  <div
                    key={day.date}
                    className={cn(
                      "border rounded-lg p-3 min-h-[120px]",
                      todayDate && "bg-blue-50 border-blue-300",
                      !hasEvents && "bg-muted/20"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          {day.day}
                        </p>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            todayDate && "text-blue-600"
                          )}
                        >
                          {new Date(day.date).getDate()}
                        </p>
                      </div>

                      {hasEvents && (
                        <div className="space-y-1">
                          {day.events.map((event, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "text-xs p-1.5 rounded",
                                event.type === "incoming"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              )}
                            >
                              <div className="flex items-center gap-1">
                                {event.type === "incoming" ? (
                                  <ArrowDownCircle className="h-3 w-3" />
                                ) : (
                                  <ArrowUpCircle className="h-3 w-3" />
                                )}
                                <span className="font-semibold">
                                  ${(event.amount / 1000).toFixed(0)}k
                                </span>
                              </div>
                              {event.overdue && (
                                <Badge
                                  variant="destructive"
                                  className="text-[9px] h-4 mt-1"
                                >
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
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
                <FileText className="mr-2 h-4 w-4" />
                Create New Receivable
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/members/add">
                <Users className="mr-2 h-4 w-4" />
                Add Team Member
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/documents">
                <FileText className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/receivables/lifecycle">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Lifecycle Tracker
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Active Receivables Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Active Receivables</CardTitle>
            <CardDescription>Summary by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Awaiting Payment (3)
                </span>
                <span className="font-medium">$545,000</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Has Buyer (2)</span>
                <span className="font-medium">$345,000</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Seeking Buyer (1)</span>
                <span className="font-medium">$180,000</span>
              </div>
              <Progress value={22} className="h-2" />
            </div>

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/receivables">
                View All Receivables
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>
                Latest documents uploaded to the system
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/documents">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.uploadedBy}</TableCell>
                  <TableCell>
                    {new Date(doc.uploadDate).toLocaleDateString("en-US")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(doc.status)}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/documents/${doc.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
