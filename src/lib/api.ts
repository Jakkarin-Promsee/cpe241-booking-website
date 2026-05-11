const BASE_URL = 'http://localhost:5000';
const AUTH_STORAGE_KEY = 'cinema-admin-auth';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('cinema-admin-auth');
    if (!stored) return null;
    return (JSON.parse(stored) as { state?: { token?: string } })?.state?.token ?? null;
  } catch {
    return null;
  }
}

function clearPersistedAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore storage write errors
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearPersistedAuth();
    window.location.replace('/admin/login');
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = await res.json() as { error?: string; message?: string };
      message = json.error ?? json.message ?? message;
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                => request<T>('GET',    path),
  post:   <T>(path: string, body: unknown) => request<T>('POST',   path, body),
  put:    <T>(path: string, body: unknown) => request<T>('PUT',    path, body),
  delete: <T>(path: string)               => request<T>('DELETE', path),
};
