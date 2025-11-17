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
import { useMe, useSearchUsers } from "@/lib/api/schemas/user";

// ---- roles from your schema ----
const availableRoles = ["ADMIN", "BUYER", "SELLER", "ISSUER"];

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
  return status === "Active" ? "default" : "destructive";
};

const getInitials = (name) => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function OrganizationMembersPage() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [members, setMembers] = useState([]);

  console.log("[OrgMembers] render");

  // ---- 1) Get current user (/me) ----
  const { data: me, isLoading: isMeLoading, isError: isMeError } = useMe();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[OrgMembers] /me changed:", { me, isMeLoading, isMeError });
  }, [me, isMeLoading, isMeError]);

  // ---- 2) Prepare filters for /v1/user/search ----
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
    // eslint-disable-next-line no-console
    console.log("[OrgMembers] data changed:", {
      usersData,
      isUsersLoading,
      isUsersError,
    });
  }, [usersData, isUsersLoading, isUsersError]);

  // ---- 3) Map real users into table rows (local state) ----
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

        return {
          id,
          name,
          email: user.email,
          phone: user.phone ?? "",
          role: user.role,
          joinDate,
          status: "Active",
          avatar: "",
        };
      });

      return mapped;
    });
  }, [usersData]);

  // ---- 4) Local-only UI actions (no backend yet) ----
  const handleRoleChange = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleBlockUser = (memberId) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? {
              ...member,
              status: member.status === "Active" ? "Blocked" : "Active",
            }
          : member
      )
    );
  };

  const handleDeleteUser = (memberId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    }
  };

  // ---- 5) Table columns ----
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
        return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;

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

              <DropdownMenuItem onClick={() => handleBlockUser(member.id)}>
                <Ban className="mr-2 h-4 w-4" />
                {member.status === "Active" ? "Block User" : "Unblock User"}
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
            <Button>
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
                {isUsersLoading && !members.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading members...
                    </TableCell>
                  </TableRow>
                ) : isUsersError ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-destructive"
                    >
                      Failed to load members.
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
              {totalRows} member(s) total
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
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
