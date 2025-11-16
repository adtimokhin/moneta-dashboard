import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas";
import { User, UserCreate, UserFilters } from "./schemas";

/** GET /v1/users → User[] */
export async function listUsers(): Promise<z.infer<typeof zUsers>> {
  const { data } = await api.get("/v1/user");
  return zUsers.parse(data);
}
const zUsers = arrayOf(User);

/** POST /v1/users → User */
export async function createUser(payload: UserCreate): Promise<User> {
  const { data } = await api.post("/v1/user", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return User.parse(data);
}

/** GET /v1/me → User */
export async function getMe(): Promise<User> {
  const { data } = await api.get("/v1/me");
  return User.parse(data);
}

/** GET /v1/user/{id} → User | null */
export async function getUserById(userId: string): Promise<User | null> {
  const { data } = await api.get(`/v1/user/${userId}`);
  if (data == null) {
    return null;
  }
  return User.parse(data);
}

/** POST /v1/user/search → User[] */
export async function searchUsers(
  filters: UserFilters
): Promise<z.infer<typeof zUsers>> {
  const { data } = await api.post("/v1/user/search", filters, {
    headers: { "Content-Type": "application/json" },
  });
  return zUsers.parse(data);
}
