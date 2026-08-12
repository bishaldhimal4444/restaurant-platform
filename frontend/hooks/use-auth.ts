'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { User } from '../lib/types';

interface MeResponse {
  user: (Pick<User, 'email' | 'role'> & { userId: string }) | null;
}

async function fetchMe(): Promise<MeResponse> {
  const res = await fetch('/api/auth/me');
  return res.json();
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    staleTime: 60 * 1000,
  });

  return {
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message ?? 'Login failed');
      }
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.refresh();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      name: string;
      password: string;
      role?: 'CUSTOMER' | 'OWNER';
    }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message ?? 'Registration failed');
      }
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.refresh();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/');
      router.refresh();
    },
  });
}
