const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://crowdesk.crowdemo.com/api/v1").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function safeMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Invalid API path.");
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      cache: "no-store",
      credentials: "omit",
      redirect: "error"
    });
  } catch {
    throw new Error("Unable to reach Crow Desk. Check the connection and try again.");
  }

  const contentType = response.headers.get("content-type") || "";
  let payload: unknown = null;
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  } else if (response.status !== 204) {
    const text = await response.text().catch(() => "");
    payload = { message: text.slice(0, 300) };
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("crowdesk:unauthorized"));
    }
    throw new ApiError(safeMessage(payload, `Request failed (${response.status}).`), response.status, payload);
  }

  return payload as T;
}

export function asArray<T>(value: unknown): T[] {
  let current = value;
  for (let i = 0; i < 4; i += 1) {
    if (Array.isArray(current)) return current as T[];
    if (current && typeof current === "object" && "data" in current) {
      current = (current as { data: unknown }).data;
      continue;
    }
    break;
  }
  return [];
}

export function unwrapObject<T>(value: unknown, key?: string): T | null {
  let current = value;
  if (key && current && typeof current === "object" && key in current) {
    current = (current as Record<string, unknown>)[key];
  }
  for (let i = 0; i < 3; i += 1) {
    if (current && typeof current === "object" && "data" in current) {
      current = (current as { data: unknown }).data;
      continue;
    }
    break;
  }
  return current && typeof current === "object" ? (current as T) : null;
}
