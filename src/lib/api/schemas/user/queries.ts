import { buildKeys } from "@/lib/api/utils";

export const usersKeys = buildKeys("users");
// -> usersKeys.all, usersKeys.list({}), usersKeys.detail(id)  (detail reserved for future)
