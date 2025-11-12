"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  fullName: z
    .string()
    .min(1, "Full legal name is required")
    .min(2, "Name must be at least 2 characters"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
      "Please enter a valid phone number"
    ),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Initial status is required"),
});

export default function AddUserPage() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      address: "",
      phoneNumber: "",
      role: undefined,
      status: undefined,
    },
  });

  const onSubmit = (values) => {
    console.log("New user data:", values);
    // Here you would typically:
    // 1. Send data to your API
    // 2. Show success notification
    // 3. Redirect to members page
    // Example: await fetch('/api/users', { method: 'POST', body: JSON.stringify(values) })

    // For now, just log and redirect
    alert("User added successfully!");
    router.push("/members"); // Adjust path as needed
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">Add New Member</h1>
          <p className="text-muted-foreground">
            Add a new member to your organization
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Member Information
          </CardTitle>
          <CardDescription>
            Enter the details of the new organization member
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be used for login and notifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Full Legal Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Legal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Michael Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the complete legal name as it appears on official
                      documents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="123 Main Street, Apt 4B, New York, NY 10001"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Full address including street, city, state, and postal
                      code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include country code if applicable
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Determines the user's permissions in the system
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Initial Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select initial status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Set whether the user can access the system immediately
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
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="px-8">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
