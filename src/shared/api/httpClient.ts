import type { ApiFieldError, ApiResponse, SessionPayload } from "./types.ts";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

/**
 * The access token is deliberately kept in memory only.
 *
 * Storing it in localStorage would expose it to any XSS on the page. The long
 * lived credential is the refresh token, which the API sets as an HTTP-only
 * cookie that no script can read at all.
 */
let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

/** Lets the auth context clear its state when a refresh finally fails. */
export const setSessionExpiredHandler = (handler: (() => void) | null): void => {
  onSessionExpired = handler;
};

export interface RequestOptions {
  headers?: Record<string, string>;
  /** Skips the refresh-and-retry cycle, for the refresh call itself. */
  skipRefresh?: boolean;
}

export class ApiClientError extends Error {
  readonly status: number | undefined;
  readonly errors: ApiFieldError[];

  constructor(message: string, { status, errors = [] }: { status?: number; errors?: ApiFieldError[] } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }

  /** First field-level validation message, if the API returned any. */
  get firstFieldError(): string | null {
    return this.errors[0]?.message ?? null;
  }
}

// Endpoints that must never trigger the refresh-and-retry cycle, either
// because they are the refresh itself or because a 401 is a normal answer.
const NON_REFRESHABLE_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout", "/auth/register"];

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RawResult {
  response: Response;
  data: ApiResponse<unknown> | null;
}

let refreshPromise: Promise<SessionPayload> | null = null;

const parseBody = async (response: Response): Promise<ApiResponse<unknown> | null> => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return response.json().catch(() => null);
};

const performRequest = async (
  method: Method,
  path: string,
  body: unknown,
  options: RequestOptions
): Promise<RawResult> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    // Required so the refresh-token cookie is sent and can be updated.
    credentials: "include",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return { response, data: await parseBody(response) };
};

/**
 * Refreshes the access token at most once at a time: concurrent 401s all wait
 * on the same promise instead of firing a stampede of refresh calls.
 */
const refreshAccessToken = (): Promise<SessionPayload> => {
  if (!refreshPromise) {
    refreshPromise = performRequest("POST", "/auth/refresh", null, {})
      .then(({ response, data }) => {
        if (!response.ok || !data) throw new Error("refresh_failed");
        const payload = data.data as SessionPayload;
        setAccessToken(payload.accessToken);
        return payload;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const request = async <TData>(
  method: Method,
  path: string,
  body: unknown = null,
  options: RequestOptions = {}
): Promise<ApiResponse<TData>> => {
  let { response, data } = await performRequest(method, path, body, options);

  const canRetry =
    response.status === 401 && !options.skipRefresh && !NON_REFRESHABLE_PATHS.includes(path);

  if (canRetry) {
    try {
      await refreshAccessToken();
      ({ response, data } = await performRequest(method, path, body, options));
    } catch {
      setAccessToken(null);
      onSessionExpired?.();
    }
  }

  if (!response.ok) {
    throw new ApiClientError(data?.message || `Request failed (${response.status})`, {
      status: response.status,
      errors: data?.errors || [],
    });
  }

  return data as ApiResponse<TData>;
};

export const httpClient = {
  get: <TData>(path: string, options?: RequestOptions) => request<TData>("GET", path, null, options),
  post: <TData>(path: string, body?: unknown, options?: RequestOptions) =>
    request<TData>("POST", path, body ?? null, options),
  patch: <TData>(path: string, body?: unknown, options?: RequestOptions) =>
    request<TData>("PATCH", path, body ?? null, options),
  put: <TData>(path: string, body?: unknown, options?: RequestOptions) =>
    request<TData>("PUT", path, body ?? null, options),
  // A body is optional on DELETE; the permanent-delete endpoint uses one to
  // carry its confirmation field.
  delete: <TData>(path: string, body: unknown = null, options?: RequestOptions) =>
    request<TData>("DELETE", path, body, options),
};

export default httpClient;
