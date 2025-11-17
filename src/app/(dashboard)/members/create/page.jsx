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
import { useCreateUser, useMe } from "@/lib/api/schemas/user";
import { UserRole } from "@/lib/api/schemas/shared/schemas";
import { toast } from "sonner";
import { useEffect } from "react";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["ADMIN", "BUYER", "SELLER", "ISSUER"], {
    errorMap: () => ({ message: "Role is required" }),
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function AddUserPage() {
  const router = useRouter();
  const { data: me, isLoading: isMeLoading, isError: isMeError } = useMe();
  const {
    mutate: createUser,
    isPending: isUserCreateLoading,
    error: userCreateError,
  } = useCreateUser();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: undefined,
    },
  });

  const onSubmit = (values) => {
    createUser(
      {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        companyId: me.companyId,
        role: values.role,
      },
      {
        onSuccess: () => {
          // 2. Show success notification
          toast.success("User was added");
          // 3. Redirect to members page on success
          router.push("/members");
        },
        onError: (error) => {
          const errorCode = error.status;
          switch (errorCode) {
            case 401:
              // 401 - User is not authenticated -> Need to redirect User to login
              router.push("/login");
              break;
            case 403:
              // 403 - user does not have the premissions -> Toast + redirect to dashboard
              toast.error("Only admins of the company can add new users");
              router.push("/"); // dashboard
              break;
            case 404:
              // 404 - company does not exist -> Toast + redirect to dashboard + Need to notify the system - this should not be happening.
              toast.error("Your company does not exist");
              router.push("/"); // dashboard
              break;
            case 409:
              // 409 - such user (with such email) already exists
              toast.error("User this such email already exists");
              break;
            case 422:
              // 422 - the request is formed incorrectly -> a system issue (need to tell the system owners) + toast + redirect to members page
              toast.error(
                "The form for adding new users is broke. Please try again later"
              );
              router.push("/members"); // members page
              break;
            case 500:
              // 500 - internal server error creating the entity  -> a system issue (need to tell the system owners) + toast + redirect to members page
              toast.error("There was a server error while adding new user");
              router.push("/members"); // members page
              break;

            default:
              // Unknown error
              toast.error("Unknown error occured");
              console.log("ERROR", error);
              router.push("/members"); // members page
              break;
          }
        },
      }
    );
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

              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="John" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the complete legal name as it appears on official
                      documents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="John" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the complete legal name as it appears on official
                      documents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="***" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a password. It must be at least 8 characters long
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
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="BUYER">BUYER</SelectItem>
                        <SelectItem value="SELLER">SELLER</SelectItem>
                        <SelectItem value="ISSUER">ISSUER</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Determines the user's permissions in the system
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
