import { z } from "zod";
import { api } from "@/lib/api/client";
import { arrayOf } from "@/lib/api/schemas/shared/schemas";
import { User, UserCreate } from "./schemas";

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
