export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

type RequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string | null;
  skipAuthRefresh?: boolean;
};

let accessTokenMemory: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken() {
  return accessTokenMemory;
}

export function setAccessToken(token: string | null) {
  accessTokenMemory = token;
}

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Request failed';
    return new ApiError(response.status, message);
  } catch {
    return new ApiError(response.status, 'Request failed');
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = options.accessToken ?? accessTokenMemory;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  if (response.status === 401 && !options.skipAuthRefresh && !path.startsWith('/auth/')) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, {
        ...options,
        accessToken: refreshed,
        skipAuthRefresh: true,
      });
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const data = await apiRequest<AuthResponse>('/auth/refresh', {
          method: 'POST',
          skipAuthRefresh: true,
        });
        accessTokenMemory = data.accessToken;
        return data.accessToken;
      } catch {
        accessTokenMemory = null;
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}
