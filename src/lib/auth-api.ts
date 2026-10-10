import { apiRequest, type AuthResponse, type AuthUser } from '@/lib/api';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  name: string;
  password: string;
};

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    skipAuthRefresh: true,
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    skipAuthRefresh: true,
  });
}

export function fetchMe() {
  return apiRequest<AuthUser>('/auth/me');
}

export function logoutRequest() {
  return apiRequest<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    skipAuthRefresh: true,
  });
}
