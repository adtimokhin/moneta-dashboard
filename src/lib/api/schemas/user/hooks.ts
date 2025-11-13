import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsers, createUser, getMe } from "./service";
import { usersKeys } from "./queries";
import type { UserCreate } from "./schemas";

export function useUsers() {
  return useQuery({
    queryKey: usersKeys.list({}),
    queryFn: listUsers,
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
  return useQuery({
    queryKey: usersKeys.me(),
    queryFn: getMe,
    // optional niceties:
    // staleTime: 5 * 60_000,
    // refetchOnWindowFocus: false,
  });
}
