// Thin fetch wrapper for the real backend. All HTTP access goes through here
// so components never call fetch directly.

import { API_BASE_URL } from "@/shared/services/config";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
};

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "";
    try {
      const data = (await response.json()) as { message?: string };
      detail = data?.message ?? "";
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(detail || `Request failed (${response.status}).`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    signal: options.signal,
    headers: isForm
      ? { Accept: "application/json" }
      : { Accept: "application/json", "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
  });
  return parse<T>(response);
}
