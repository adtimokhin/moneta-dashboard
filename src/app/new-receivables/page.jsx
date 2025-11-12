"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  issuerName: z.string().min(1, "Issuer name is required"),
  valueUsd: z
    .string()
    .min(1, "Value is required")
    .refine((val) => !Number.isNaN(parseFloat(val)), "Must be a number"),
  maturityDate: z.date({
    required_error: "Maturity date is required",
  }),
  paymentHistory: z.string().optional(),
  parameter: z.string().optional(),
});

export default function CreateReceivablePage() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issuerName: "",
      valueUsd: "",
      paymentHistory: "",
      parameter: undefined,
      maturityDate: undefined,
    },
  });

  const onSubmit = (values) => {
    console.log("Create receivable:", values);
  };

  return (
    <div className="flex w-full justify-center py-10">
      <Card className="w-full max-w-2xl border border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Create New Receivable
          </CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Issuer Name */}
              <FormField
                control={form.control}
                name="issuerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter issuer legal entity name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Value (USD) */}
              <FormField
                control={form.control}
                name="valueUsd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="e.g., 500000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Maturity Date */}
              <FormField
                control={form.control}
                name="maturityDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Maturity Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "dd/mm/yyyy"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment History */}
              <FormField
                control={form.control}
                name="paymentHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Last 3 payments on time"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: brief history or notes on issuer behavior.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Add Parameter */}
              <FormField
                control={form.control}
                name="parameter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Add Parameter</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parameter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="debtor_rating">
                          Debtor Credit Rating
                        </SelectItem>
                        <SelectItem value="jurisdiction">
                          Jurisdiction
                        </SelectItem>
                        <SelectItem value="trade_type">Trade Type</SelectItem>
                        <SelectItem value="tenor_bucket">
                          Tenor Bucket
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Configure how this receivable will be evaluated.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Supporting Documents */}
              <div className="space-y-2">
                <FormLabel>Supporting Documents</FormLabel>
                <Input type="file" multiple className="cursor-pointer" />
                <p className="text-xs text-muted-foreground">
                  Upload invoices, contracts, or other supporting documents
                  (PDF, DOC, images).
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="px-8">
                Create Receivable
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
