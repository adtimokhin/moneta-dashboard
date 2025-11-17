import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUsers,
  createUser,
  getMe,
  searchUsers,
  getUserById,
} from "./service";
import { usersKeys } from "./queries";
import type { UserCreate, UserFilters } from "./schemas";
import { useMeStore } from "@/lib/persist/auth/meStore";

type UseSearchUsersOptions = {
  enabled?: boolean;
};

export function useUsers(options?: UseSearchUsersOptions) {
  return useQuery({
    queryKey: usersKeys.list({}),
    queryFn: listUsers,
    enabled: options?.enabled,
  });
}

export function useSearchUsers(
  filters: UserFilters,
  options?: UseSearchUsersOptions
) {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => searchUsers(filters),
    enabled: options?.enabled,
  });
}

export function useUser(
  userId: string | undefined,
  options?: UseSearchUsersOptions
) {
  return useQuery({
    queryKey: usersKeys.detail(userId ?? "unknown"),
    queryFn: () => getUserById(userId as string),
    enabled: options?.enabled && !!userId,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreate) => createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useMe() {
  const { setMe } = useMeStore();

  const query = useQuery({
    queryKey: usersKeys.me(),
    queryFn: getMe,
  });

  React.useEffect(() => {
    if (query.data) {
      setMe(query.data);
    }
  }, [query.data, setMe]);

  return query;
}
