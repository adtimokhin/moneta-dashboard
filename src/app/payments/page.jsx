"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Calendar as CalendarIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Sample payment data
const paymentEvents = [
  {
    id: "1",
    date: "2024-11-15",
    type: "incoming",
    amount: 150000,
    description: "Payment from ABC Corporation",
    receivableId: "R001",
    status: "scheduled",
  },
  {
    id: "2",
    date: "2024-11-20",
    type: "outgoing",
    amount: 250000,
    description: "Payment to Investment Fund A",
    receivableId: "R002",
    buyer: "Investment Fund A",
    status: "scheduled",
  },
  {
    id: "3",
    date: "2024-11-16",
    type: "incoming",
    amount: 75000,
    description: "Payment from DEF Industries",
    receivableId: "R003",
    status: "scheduled",
  },
  {
    id: "4",
    date: "2024-11-25",
    type: "outgoing",
    amount: 95000,
    description: "Payment to Investment Fund B",
    receivableId: "R006",
    buyer: "Investment Fund B",
    status: "scheduled",
  },
  {
    id: "5",
    date: "2024-11-12",
    type: "incoming",
    amount: 180000,
    description: "Payment from GHI Company",
    receivableId: "R004",
    status: "overdue",
  },
  {
    id: "6",
    date: "2024-12-01",
    type: "incoming",
    amount: 320000,
    description: "Payment from JKL Enterprises",
    receivableId: "R005",
    status: "scheduled",
  },
  {
    id: "7",
    date: "2024-12-05",
    type: "outgoing",
    amount: 120000,
    description: "Payment to Partner LLC",
    receivableId: "R007",
    buyer: "Partner LLC",
    status: "scheduled",
  },
  {
    id: "8",
    date: "2024-11-28",
    type: "incoming",
    amount: 95000,
    description: "Payment from MNO Limited",
    receivableId: "R008",
    status: "scheduled",
  },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PaymentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 1)); // November 2024

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calculate totals for current month
  const currentMonthEvents = paymentEvents.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === month && eventDate.getFullYear() === year;
  });

  const totalIncoming = currentMonthEvents
    .filter((e) => e.type === "incoming")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOutgoing = currentMonthEvents
    .filter((e) => e.type === "outgoing")
    .reduce((sum, e) => sum + e.amount, 0);

  const netAmount = totalIncoming - totalOutgoing;

  // Get events for a specific date
  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return paymentEvents.filter((event) => event.date === dateStr);
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Check if date is in the past
  const isPast = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Create calendar grid
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Payment Calendar</h1>
          <p className="text-muted-foreground">
            Track upcoming payments and receivables
          </p>
        </div>
        <Button onClick={goToToday} variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Today
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expected Incoming
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncoming.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMonthEvents.filter((e) => e.type === "incoming").length}{" "}
              payment(s) this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expected Outgoing
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalOutgoing.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMonthEvents.filter((e) => e.type === "outgoing").length}{" "}
              payment(s) this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                netAmount >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {netAmount >= 0 ? "+" : ""}${netAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              For {MONTHS[month]} {year}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {MONTHS[month]} {year}
              </CardTitle>
              <CardDescription>
                Click on a date to view payment details
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2" />;
              }

              const events = getEventsForDate(day);
              const hasEvents = events.length > 0;
              const hasIncoming = events.some((e) => e.type === "incoming");
              const hasOutgoing = events.some((e) => e.type === "outgoing");
              const hasOverdue = events.some((e) => e.status === "overdue");

              return (
                <HoverCard key={day}>
                  <HoverCardTrigger asChild>
                    <div
                      className={cn(
                        "min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                        isToday(day) && "bg-blue-50 border-blue-300",
                        isPast(day) && "bg-muted/20"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isToday(day) && "text-blue-600 font-bold"
                          )}
                        >
                          {day}
                        </span>
                        {hasOverdue && (
                          <Badge
                            variant="destructive"
                            className="h-5 text-[10px] px-1"
                          >
                            !
                          </Badge>
                        )}
                      </div>

                      {hasEvents && (
                        <div className="space-y-1">
                          {hasIncoming && (
                            <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-1 py-0.5 rounded">
                              <ArrowDownCircle className="h-3 w-3" />
                              <span className="font-medium">
                                {
                                  events.filter((e) => e.type === "incoming")
                                    .length
                                }
                              </span>
                            </div>
                          )}
                          {hasOutgoing && (
                            <div className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-1 py-0.5 rounded">
                              <ArrowUpCircle className="h-3 w-3" />
                              <span className="font-medium">
                                {
                                  events.filter((e) => e.type === "outgoing")
                                    .length
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </HoverCardTrigger>

                  {hasEvents && (
                    <HoverCardContent className="w-80" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">
                            {MONTHS[month]} {day}, {year}
                          </h4>
                          <Badge variant="outline">
                            {events.length} event(s)
                          </Badge>
                        </div>
                        <Separator />
                        {events.map((event) => (
                          <div
                            key={event.id}
                            className="space-y-1 pb-2 border-b last:border-b-0 last:pb-0"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {event.type === "incoming" ? (
                                  <ArrowDownCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ArrowUpCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm font-medium">
                                  {event.type === "incoming"
                                    ? "Receiving"
                                    : "Paying"}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  "text-sm font-bold",
                                  event.type === "incoming"
                                    ? "text-green-600"
                                    : "text-red-600"
                                )}
                              >
                                ${event.amount.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">
                              {event.description}
                            </p>
                            {event.status === "overdue" && (
                              <Badge
                                variant="destructive"
                                className="text-xs ml-6"
                              >
                                Overdue
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  )}
                </HoverCard>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded" />
              <span className="text-sm">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                <ArrowDownCircle className="h-3 w-3" />
                <span>1</span>
              </div>
              <span className="text-sm">Incoming Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                <ArrowUpCircle className="h-3 w-3" />
                <span>1</span>
              </div>
              <span className="text-sm">Outgoing Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="h-5 text-[10px] px-1">
                !
              </Badge>
              <span className="text-sm">Overdue Payment</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
