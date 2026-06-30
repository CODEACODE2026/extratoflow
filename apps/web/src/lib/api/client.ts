export type ApiErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "INVALID_CREDENTIALS"
  | "INVALID_SESSION"
  | "LOGIN_FIELDS_REQUIRED"
  | "PERMISSION_DENIED"
  | "UNKNOWN_ERROR";

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;

  constructor(message: string, status: number, code: ApiErrorCode = "UNKNOWN_ERROR") {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api/v1";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

const normalizeBody = (body: ApiRequestOptions["body"]) => {
  if (!body || body instanceof FormData || typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
};

export async function apiRequest<ResponseBody>(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers);
  const body = normalizeBody(options.body);

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    body,
    credentials: "include",
    headers
  });

  if (response.status === 204) {
    return undefined as ResponseBody;
  }

  const data = (await response.json().catch(() => undefined)) as
    | { code?: ApiErrorCode; message?: string }
    | ResponseBody
    | undefined;

  if (!response.ok) {
    const errorData = data as { code?: ApiErrorCode; message?: string } | undefined;

    throw new ApiError(
      errorData?.message ?? "Nao foi possivel concluir a requisicao.",
      response.status,
      errorData?.code ?? "UNKNOWN_ERROR"
    );
  }

  return data as ResponseBody;
}
