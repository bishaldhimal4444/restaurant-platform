import { apiFetch } from './client';
import type { AuthResponse, User } from '../types';

export function register(data: {
  email: string;
  name: string;
  password: string;
  role?: 'CUSTOMER' | 'OWNER';
}) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function login(data: { email: string; password: string }) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMe(token: string) {
  return apiFetch<Pick<User, 'id' | 'email' | 'role'> & { userId: string }>('/auth/me', {
    token,
  });
}
