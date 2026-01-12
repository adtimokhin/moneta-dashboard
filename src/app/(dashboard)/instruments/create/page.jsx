"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { useCreateInstrument } from "@/lib/api/schemas/instrument";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Instrument name is required"),
  faceValue: z
    .string()
    .min(1, "Face value is required")
    .refine((val) => !Number.isNaN(parseFloat(val)) && parseFloat(val) > 0, "Must be a positive number"),
  currency: z.string().min(3, "Currency is required").max(3, "Currency must be 3 characters"),
  maturityDate: z.date({
    required_error: "Maturity date is required",
  }),
  maturityPayment: z
    .string()
    .min(1, "Maturity payment is required")
    .refine((val) => !Number.isNaN(parseFloat(val)) && parseFloat(val) > 0, "Must be a positive number"),
  publicPayloadDescription: z.string().optional(),
});

export default function CreateReceivablePage() {
  const router = useRouter();
  const createInstrument = useCreateInstrument();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      faceValue: "",
      currency: "USD",
      maturityPayment: "",
      maturityDate: undefined,
      publicPayloadDescription: "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Transform form data to API format
      const payload = {
        name: values.name,
        faceValue: parseFloat(values.faceValue),
        currency: values.currency.toUpperCase(),
        maturityDate: format(values.maturityDate, "yyyy-MM-dd"),
        maturityPayment: parseFloat(values.maturityPayment),
        ...(values.publicPayloadDescription && {
          publicPayload: {
            description: values.publicPayloadDescription,
          },
        }),
      };

      await createInstrument.mutateAsync(payload);

      toast.success(
        "Instrument created successfully. It is now in DRAFT status."
      );

      // Redirect to track page or show success message
      router.push("/receivables/track");
    } catch (error) {
      toast.error(error.message || "Failed to create instrument");
    } finally {
      setIsSubmitting(false);
    }
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
              {/* Instrument Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrument Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter instrument name (e.g., Corporate Bond 2025)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Face Value */}
              <FormField
                control={form.control}
                name="faceValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Face Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="e.g., 10000.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The initial value of the instrument
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="USD"
                        maxLength={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ISO 4217 currency code (3 characters)
                    </FormDescription>
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

              {/* Maturity Payment */}
              <FormField
                control={form.control}
                name="maturityPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maturity Payment</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="e.g., 10500.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The amount paid at maturity (typically face value + interest)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description (Public Payload) */}
              <FormField
                control={form.control}
                name="publicPayloadDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Corporate bond with 5% annual yield"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Additional information about this instrument
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="px-8" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Instrument"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
