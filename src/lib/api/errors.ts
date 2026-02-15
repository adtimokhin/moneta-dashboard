import { AxiosError } from "axios";

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
  status?: number;
};

export function toApiError(err: unknown): ApiError {
  const ax = err as AxiosError<any>;
  const status = ax?.response?.status;
  const data = ax?.response?.data as any | undefined;

  const code = data?.code ?? (status ? `HTTP_${status}` : "UNKNOWN");

  const message = data?.message ?? ax?.message ?? "Unexpected error";

  return { code, message, details: data, status };
}
