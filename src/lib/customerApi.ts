const DEFAULT_API_ORIGIN = "http://localhost:5000";

const API_ORIGIN = (() => {
  const raw = import.meta.env.VITE_API_URL?.trim();
  const base = raw && raw.length > 0 ? raw : DEFAULT_API_ORIGIN;
  return base.replace(/\/+$/, "");
})();

const CUSTOMER_AUTH_KEY = "cinema-customer-auth";

function getCustomerToken(): string | null {
  try {
    const stored = localStorage.getItem(CUSTOMER_AUTH_KEY);
    if (!stored) return null;
    return (
      (JSON.parse(stored) as { state?: { token?: string } })?.state?.token ??
      null
    );
  } catch {
    return null;
  }
}

function clearCustomerAuth(): void {
  try {
    localStorage.removeItem(CUSTOMER_AUTH_KEY);
  } catch {
    // ignore
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getCustomerToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_ORIGIN}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = (await res.json()) as { error?: string; message?: string };
      message = json.error ?? json.message ?? message;
    } catch {
      // ignore
    }
    if (res.status === 401 && token) {
      clearCustomerAuth();
      window.location.replace("/login");
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const customerApi = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
};
