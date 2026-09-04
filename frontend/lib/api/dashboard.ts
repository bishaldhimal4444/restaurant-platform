import { apiFetch } from './client';
import type { DailyDashboard } from '../types';

export function getDailyDashboard(token: string, date?: string) {
  const query = date ? `?date=${date}` : '';
  return apiFetch<DailyDashboard>(`/dashboard/daily${query}`, { token });
}
