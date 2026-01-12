import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas";
import { User, UserCreate, UserFilters, UserPatch } from "./schemas";
import { EP } from "../../endpoints";

/** GET /v1/users → User[] */
export async function listUsers(): Promise<z.infer<typeof zUsers>> {
  const { data } = await api.get(EP.v1.userGetAll());
  return zUsers.parse(data);
}
const zUsers = arrayOf(User);

/** POST /v1/users → User */
export async function createUser(payload: UserCreate): Promise<User> {
  const { data } = await api.post(EP.v1.userCreate(), payload, {
    headers: { "Content-Type": "application/json" },
  });
  return User.parse(data);
}

/** GET /v1/me → User */
export async function getMe(): Promise<User> {
  const { data } = await api.get(EP.v1.me());
  return User.parse(data);
}

/** GET /v1/user/{id} → User | null */
export async function getUserById(userId: string): Promise<User | null> {
  const { data } = await api.get(EP.v1.userGetById(userId));
  if (data == null) {
    return null;
  }
  return User.parse(data);
}

/** POST /v1/user/search → User[] */
export async function searchUsers(
  filters: UserFilters
): Promise<z.infer<typeof zUsers>> {
  const { data } = await api.post(EP.v1.userSearch(), filters, {
    headers: { "Content-Type": "application/json" },
  });
  return zUsers.parse(data);
}

/** PATCH /v1/user/{id} → User */
export async function patchUser(
  userId: string,
  payload: z.infer<typeof UserPatch>
): Promise<User> {
  const { data } = await api.patch(EP.v1.userPatchById(userId), payload, {
    headers: { "Content-Type": "application/json" },
  });
  return User.parse(data);
}

/** DELETE /v1/user/{id} → void */
export async function deleteUser(userId: string): Promise<User> {
  const { data } = await api.delete(EP.v1.userDeleteById(userId));
  return User.parse(data);
}
