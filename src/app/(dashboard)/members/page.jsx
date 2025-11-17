"use client";

import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Search,
  MoreHorizontal,
  UserPlus,
  Trash2,
  Ban,
  UserCog,
  Mail,
  Phone,
  Circle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteUser,
  useMe,
  usePatchUser,
  useSearchUsers,
} from "@/lib/api/schemas/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActivationStatus } from "@/lib/api/schemas/shared/schemas";

const availableRoles = ["ADMIN", "BUYER", "SELLER", "ISSUER"];

// Mapping from backend enum values to human-readable labels
const STATUS_LABELS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING: "Pending verification",
  SUSPENDED: "Suspended",
  DISABLED: "Disabled",
  DELETED: "Deleted",
  BANNED: "Banned",
  LOCKED: "Locked",
  AWAITING_APPROVAL: "Awaiting approval",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
  UNVERIFIED: "Unverified",
};

const getRoleBadgeVariant = (role) => {
  switch (role) {
    case "ADMIN":
      return "default";
    case "BUYER":
      return "secondary";
    case "SELLER":
      return "outline";
    case "ISSUER":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "PENDING":
    case "AWAITING_APPROVAL":
    case "UNVERIFIED":
      return "secondary";
    case "INACTIVE":
    case "ARCHIVED":
      return "outline";
    case "SUSPENDED":
    case "DISABLED":
    case "DELETED":
    case "BANNED":
    case "LOCKED":
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
};

const getInitials = (name) => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Skeleton loading component for table rows
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-28" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-16 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-16 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-8 w-8" />
    </TableCell>
  </TableRow>
);

export default function OrganizationMembersPage() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [members, setMembers] = useState([]);
  const router = useRouter();

  const { data: me, isLoading: isMeLoading, isError: isMeError } = useMe();
  const {
    mutate: deleteUser,
    isPending: isUserDeleteLoading,
    error: userDeleteError,
  } = useDeleteUser();

  const {
    mutate: patchUser,
    isPending: isUserPatchLoading,
    error: userPatchError,
  } = usePatchUser();

  const userFilters = useMemo(
    () => ({
      companyId: me?.companyId ?? undefined,
      limit: 200,
      offset: 0,
      sort: "-created_at",
    }),
    [me?.companyId]
  );

  const usersEnabled = !!me?.companyId;

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useSearchUsers(userFilters, { enabled: usersEnabled });

  useEffect(() => {
    if (isMeError) {
      router.push("/"); // Need to re-login
    }
    if (isUsersError) {
      // This should not be happening under normal circumstances
      // TODO: Let the system admins know
      toast.error("Failed to load organization members.");
    }
  }, [isMeError, isUsersError, router]);

  useEffect(() => {
    if (!usersData) return;

    setMembers((prev) => {
      // If we already have members matching the same ids, keep local edits
      const newIds = new Set(usersData.map((u) => u.id ?? u.email));
      const prevIds = new Set(prev.map((m) => m.id));

      const sameSet =
        newIds.size === prevIds.size &&
        [...newIds].every((id) => prevIds.has(id));

      if (prev.length && sameSet) {
        return prev;
      }

      const mapped = usersData.map((user) => {
        const id = user.id ?? user.email;
        const name =
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.email;
        const joinDate = user.createdAt ?? user.created_at ?? null; // handle both camel + snake just in case

        const statusValue =
          user.accountStatus ??
          user.account_status ??
          ActivationStatus?.UNVERIFIED ??
          "UNVERIFIED";

        return {
          id,
          name,
          email: user.email,
          phone: user.phone ?? "",
          role: user.role,
          joinDate,
          status: statusValue,
          avatar: "",
        };
      });

      return mapped;
    });
  }, [usersData]);

  const handleRoleChange = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleBlockUser = (memberId, isSuspendedOrDisabled) => {
    console.log("memberID", memberId);
    patchUser(
      {
        userId: memberId,
        payload: {
          accountStatus: isSuspendedOrDisabled ? "ACTIVE" : "SUSPENDED",
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `User was ${isSuspendedOrDisabled ? "unblocked" : "suspended"}`
          );
          setMembers((prev) =>
            prev.map((member) =>
              member.id === memberId
                ? {
                    ...member,
                    status: isSuspendedOrDisabled ? "ACTIVE" : "SUSPENDED",
                  }
                : member
            )
          );
        },

        onError: (error) => {
          const errorCode = error.status;
          switch (errorCode) {
            case 403:
              // Forbidden
              toast.error("You cannot change account statuses");
              break;
            case 404:
              // User was not found
              toast.error("User does not exist");
              break;
            case 422:
              // Formatting error
              // This should happen since the user does not do anything themselves
              // TODO: warn sysadmins
              toast.error("Failed to change the account status");
              break;
            case 409:
              // User with some of these unique constraints exists
              // In this case - email is taken
              // This should happen since the user does not do anything themselves
              // TODO: warn sysadmins
              toast.error("Failed to change the account status");
              break;
            default:
              // Probably 500
              // TODO: warn sysadmins
              toast.error("Failed to change the account status");
              break;
          }
        },
      }
    );
  };

  const handleDeleteUser = (memberId) => {
    deleteUser(memberId, {
      onSuccess: () => {
        toast.success("User was deleted");
        setMembers((prev) => prev.filter((member) => member.id !== memberId));
      },
      onError: (error) => {
        const errorCode = error.status;
        switch (errorCode) {
          case 403:
            // Forbidden
            toast.error("Error deleting the user");
            break;
          case 404:
            // No User
            toast.error("User does not exist");
            break;
          case 500:
            // Internal server error
            toast.error("Error deleting the user");
            break;
        }
        console.error("error deleting a user", error);
      },
    });
  };

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Member
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {member.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const value = row.getValue("phone");
        if (!value) {
          return (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />—
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {value}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const role = row.getValue("role");
        return <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>;
      },
    },
    {
      accessorKey: "joinDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Join Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const raw = row.getValue("joinDate");
        if (!raw) {
          return <div className="text-muted-foreground">—</div>;
        }
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) {
          return <div className="text-muted-foreground">—</div>;
        }
        return <div>{date.toLocaleDateString("en-US")}</div>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status");
        const label = STATUS_LABELS[status] ?? status ?? "Unknown";
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {label.toString()}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;

        const isSuspendedOrDisabled =
          member.status === "SUSPENDED" ||
          member.status === "DISABLED" ||
          member.status === "AWAITING_APPROVAL";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserCog className="mr-2 h-4 w-4" />
                  Change Role
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {availableRoles.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => handleRoleChange(member.id, role)}
                      disabled={member.role === role}
                    >
                      {role}
                      {member.role === role && (
                        <span className="ml-2 text-muted-foreground">
                          (current)
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem
                onClick={() =>
                  handleBlockUser(member.id, isSuspendedOrDisabled)
                }
              >
                {isSuspendedOrDisabled ? (
                  <>
                    <Circle className="mr-2 h-4 w-4" />
                    Unblock User
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Block User
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleDeleteUser(member.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: members,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const isLoading = isUsersLoading && !members.length;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">
                Organization Members
              </CardTitle>
              <CardDescription>
                Manage members and their roles in your organization
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                router.push("/members/create");
              }}
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="h-9"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : isUsersError ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-destructive"
                    >
                      Failed to load data.
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `${totalRows} member(s) total`
              )}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
